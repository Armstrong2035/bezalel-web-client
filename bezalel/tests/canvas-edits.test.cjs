const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const swc = require('next/dist/build/swc');

async function load(filename, mocks = {}) {
  const result = await swc.transform(fs.readFileSync(filename, 'utf8'), { filename, jsc: { parser: { syntax: 'ecmascript', jsx: true }, target: 'es2020', transform: { react: { runtime: 'automatic' } } }, module: { type: 'commonjs' } });
  const module = { exports: {} };
  new Function('require', 'module', 'exports', result.code)(name => mocks[name] ?? require(name), module, module.exports);
  return module.exports;
}
const edit = { ideaId: 'a', segment: 'valueProposition', changes: { title: 'New value' }, originalValues: { title: 'Old value' } };

test('canvas edits reject unsupported fields, duplicates and missing originals', async () => {
  const { validateCanvasEdits } = await import('../src/app/lib/services/canvasEdits.mjs');
  assert.deepEqual(validateCanvasEdits([edit], true), [edit]);
  for (const edits of [[edit, edit], [{ ...edit, ideaId: '../other' }], [{ ...edit, segment: 'unknown' }], [{ ...edit, changes: { accepted: true } }], [{ ...edit, changes: { title: '' } }], [{ ...edit, originalValues: {} }]]) assert.throws(() => validateCanvasEdits(edits, true));
});

test('canvas save preserves metadata and atomically rejects changed or removed targets', async () => {
  const schema = await import('../src/app/lib/services/canvasEdits.mjs');
  const writes = [];
  const values = { a: { title: 'Old value', segment: 'valueProposition', accepted: true, priority: 1, research: { verdict: 'mixed' } }, b: { title: 'Old channel', segment: 'channels' } };
  const ref = path => ({ path, collection: name => ref(`${path}/${name}`), doc: id => ref(`${path}/${id}`) });
  const service = await load('src/app/lib/services/canvasEditService.js', {
    './canvasEdits.mjs': schema,
    '@/firebase/serverConfig': {
      admin: { firestore: { FieldValue: { serverTimestamp: () => 'timestamp' } } },
      db: { collection: name => ref(name), runTransaction: callback => callback({
        get: async reference => { const value = reference.path.endsWith('/model') ? {} : values[reference.path.split('/').pop()]; return { exists: !!value, data: () => value }; },
        update: (reference, data) => writes.push({ path: reference.path, data }),
      }) },
    },
  });
  const second = { ideaId: 'b', segment: 'channels', changes: { title: 'New channel' }, originalValues: { title: 'Old channel' } };
  const result = await service.applyCanvasEdits('owner', 'model', [edit, second]);
  assert.equal(result.length, 2);
  assert.equal(writes[0].path, 'users/owner/documents/model/canvasSegments/a');
  assert.deepEqual(writes[0].data, { title: 'New value', updatedAt: 'timestamp' });
  assert.equal(values.a.research.verdict, 'mixed');
  writes.length = 0;
  values.b.title = 'Changed elsewhere';
  await assert.rejects(service.applyCanvasEdits('owner', 'model', [edit, second]), error => error.status === 409);
  assert.equal(writes.length, 0);
  delete values.b;
  await assert.rejects(service.applyCanvasEdits('owner', 'model', [edit, second]), error => error.status === 409);
  assert.equal(writes.length, 0);
});

test('canvas proposals use saved owner-scoped ideas and reject invented targets without saving', async () => {
  const schema = await import('../src/app/lib/services/canvasEdits.mjs');
  const oldFetch = global.fetch, oldKey = process.env.DEEPSEEK_API_KEY;
  process.env.DEEPSEEK_API_KEY = 'test';
  let proposed = [edit], saved = 0;
  global.fetch = async () => Response.json({ choices: [{ message: { content: JSON.stringify({ edits: proposed, reason: 'Requested refinement' }) } }] });
  try {
    const route = await load('src/app/api/chat/canvas-edits/route.js', {
      'next/server': { NextResponse: { json: Response.json } },
      '@/app/lib/withAuth': { withAuth: handler => request => handler(request, {}, { uid: 'owner' }) },
      '@/app/lib/services/documentService': { getDocument: async uid => { assert.equal(uid, 'owner'); return { context: { idea: 'Saved business' } }; }, getDocumentCanvasIdeas: async (uid, id) => { assert.equal(uid, 'owner'); assert.equal(id, 'model'); return [{ id: 'a', segment: 'valueProposition', title: 'Old value' }]; } },
      '@/app/lib/services/canvasEditService': { applyCanvasEdits: async (uid, id, edits) => { saved++; assert.equal(uid, 'owner'); assert.deepEqual(edits, [edit]); return [{ id: 'a', changes: edits[0].changes }]; } },
      '@/app/lib/services/canvasEdits.mjs': schema,
      '@/app/lib/services/deepseekConfig.mjs': { DEEPSEEK_URL: 'https://example.invalid', getDeepSeekModel: () => 'test' },
    });
    const request = (method, body) => new Request('https://example.invalid/api/chat/canvas-edits', { method, body: JSON.stringify(body) });
    const body = { documentId: 'model', messages: [{ role: 'user', content: 'Refine the value proposition' }] };
    const result = await route.POST(request('POST', body));
    assert.equal(result.status, 200);
    assert.equal((await result.json()).edits[0].current.title, 'Old value');
    assert.equal(saved, 0);
    proposed = [{ ...edit, ideaId: 'invented' }];
    assert.equal((await route.POST(request('POST', body))).status, 502);
    assert.equal(saved, 0);
    assert.equal((await route.PATCH(request('PATCH', { documentId: 'model', edits: [edit] }))).status, 200);
    assert.equal(saved, 1);
  } finally {
    global.fetch = oldFetch;
    if (oldKey === undefined) delete process.env.DEEPSEEK_API_KEY; else process.env.DEEPSEEK_API_KEY = oldKey;
  }
});

test('canvas review sends only selected edited fields and preserves live decisions', async () => {
  const schema = await import('../src/app/lib/services/canvasEdits.mjs');
  const state = [], requests = [];
  let index = 0, store = { segments: { a: { title: 'Old value', description: 'Old description', decisionStatus: 'now', priority: 2 } } };
  const { default: Review } = await load('src/components/document/CanvasChatEdits.js', {
    react: { useState: initial => { const key = index++; if (!(key in state)) state[key] = initial; return [state[key], value => { state[key] = typeof value === 'function' ? value(state[key]) : value; }]; }, useRef: () => ({ current: null }), useEffect: () => {} },
    '@/app/lib/services/canvasEdits.mjs': schema,
    '@/stores/segmentsStore': { useSegmentsStore: { setState: update => { store = { ...store, ...update(store) }; } } },
    '@/firebase/apiFetch': { apiFetch: async (url, options) => { requests.push({ method: options.method, body: JSON.parse(options.body) }); return Response.json(options.method === 'POST' ? { edits: [{ ...edit, changes: { title: 'New value', description: 'New description' }, current: { title: 'Old value', description: 'Old description' } }], reason: 'Refine' } : { updates: [{ id: 'a', changes: { description: 'Reviewed description' } }] }); } },
  });
  function render() { index = 0; return Review({ docId: 'model', userId: 'owner', messages: [{ role: 'user', content: 'Refine' }], disabled: false }); }
  function nodes(tree) { if (!tree || typeof tree !== 'object') return []; if (Array.isArray(tree)) return tree.flatMap(nodes); return [tree, ...nodes(tree.props?.children)]; }
  await nodes(render()).find(n => n.type === 'button').props.onClick();
  const review = nodes(render());
  review.find(n => n.type === 'input').props.onChange({ target: { checked: false } });
  review.find(n => n.props?.['aria-label'] === 'Proposed Description for Old value').props.onChange({ target: { value: 'Reviewed description' } });
  assert.equal(requests.length, 1);
  await nodes(render()).find(n => n.type === 'button' && n.props.children === 'Apply selected canvas edits').props.onClick();
  assert.deepEqual(requests[1].body.edits[0].changes, { description: 'Reviewed description' });
  assert.deepEqual(store.segments.a, { title: 'Old value', description: 'Reviewed description', decisionStatus: 'now', priority: 2 });
});
