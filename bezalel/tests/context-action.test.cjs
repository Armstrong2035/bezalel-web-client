const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const swc = require('next/dist/build/swc');

async function load(filename, mocks = {}) {
  const result = await swc.transform(fs.readFileSync(filename, 'utf8'), {
    filename, jsc: { parser: { syntax: 'ecmascript', jsx: true }, target: 'es2020', transform: { react: { runtime: 'automatic' } } }, module: { type: 'commonjs' },
  });
  const module = { exports: {} };
  new Function('require', 'module', 'exports', result.code)(name => mocks[name] ?? require(name), module, module.exports);
  return module.exports;
}

test('context edits validate allowed fields and do not allow an empty business idea', async () => {
  const { validateContextChanges } = await import('../src/app/lib/services/contextChanges.mjs');
  assert.deepEqual(validateContextChanges({ goal: ' Grow ', capital: '$100' }), { goal: 'Grow', capital: '$100' });
  for (const changes of [[], null, { owner: 'other' }, { idea: ' ' }, { goal: 3 }, { goal: 'a'.repeat(4001) }]) assert.throws(() => validateContextChanges(changes));
});

test('reviewed changes preserve other fields and reject stale values atomically', async () => {
  const schema = await import('../src/app/lib/services/contextChanges.mjs');
  let current = { idea: 'Bakery', goal: 'Test', capital: '$500', custom: 'Preserve me' };
  let written;
  const path = [];
  const ref = { collection: name => { path.push(name); return ref; }, doc: id => { path.push(id); return ref; } };
  const { applyContextChanges } = await load('src/app/lib/services/contextChangeService.js', {
    './contextChanges.mjs': schema,
    '@/firebase/serverConfig': {
      db: { collection: ref.collection, runTransaction: callback => callback({ get: async () => ({ exists: true, data: () => ({ context: current }) }), update: (ref, data) => { written = data; } }) },
      admin: { firestore: { FieldValue: { serverTimestamp: () => 'timestamp' } } },
    },
  });
  const result = await applyContextChanges('owner', 'model', { goal: 'Grow' }, { goal: 'Test' });
  assert.deepEqual(path, ['users', 'owner', 'documents', 'model']);
  assert.deepEqual(result, { ...current, goal: 'Grow' });
  assert.deepEqual(written.context, result);
  current = { ...current, goal: 'Changed in another tab' };
  written = null;
  await assert.rejects(applyContextChanges('owner', 'model', { goal: 'Grow' }, { goal: 'Test' }), error => error.status === 409);
  assert.equal(written, null);
});

test('proposal generation never saves; PATCH applies only reviewed fields', async () => {
  const schema = await import('../src/app/lib/services/contextChanges.mjs');
  const originalFetch = global.fetch;
  const originalKey = process.env.DEEPSEEK_API_KEY;
  process.env.DEEPSEEK_API_KEY = 'test';
  let saves = 0;
  global.fetch = async () => Response.json({ choices: [{ message: { content: JSON.stringify({ changes: { goal: 'Grow', idea: 'Bakery' }, reason: 'Founder wants to grow.' }) } }] });
  try {
    const route = await load('src/app/api/chat/context-action/route.js', {
      'next/server': { NextResponse: { json: Response.json } },
      '@/app/lib/withAuth': { withAuth: handler => (request) => handler(request, {}, { uid: 'authenticated-owner' }) },
      '@/app/lib/services/documentService': { getDocument: async (uid, docId) => { assert.equal(uid, 'authenticated-owner'); assert.equal(docId, 'model'); return { context: { idea: 'Bakery', goal: 'Test' } }; } },
      '@/app/lib/services/contextChangeService': { applyContextChanges: async (uid, id, changes, originalValues) => { saves++; assert.equal(uid, 'authenticated-owner'); assert.deepEqual(changes, { goal: 'Grow' }); assert.deepEqual(originalValues, { goal: 'Test' }); return { idea: 'Bakery', ...changes }; } },
      '@/app/lib/services/contextChanges.mjs': schema,
      '@/app/lib/services/deepseekConfig.mjs': { DEEPSEEK_URL: 'https://example.invalid', getDeepSeekModel: () => 'test' },
    });
    const request = (method, body) => new Request('https://example.invalid/api/chat/context-action', { method, body: JSON.stringify(body) });
    const proposed = await route.POST(request('POST', { documentId: 'model', messages: [{ role: 'user', content: 'I want to grow this business.' }] }));
    assert.equal(proposed.status, 200);
    const proposal = await proposed.json();
    assert.deepEqual(proposal.changes, { goal: 'Grow' });
    assert.equal(proposal.currentContext.goal, 'Test');
    assert.equal(saves, 0);
    const invalid = await route.PATCH(request('PATCH', { documentId: 'model', changes: { goal: 'Grow' } }));
    assert.equal(invalid.status, 400);
    assert.equal(saves, 0);
    const applied = await route.PATCH(request('PATCH', { documentId: 'model', changes: { goal: 'Grow' }, originalValues: { goal: 'Test' } }));
    assert.equal(applied.status, 200);
    assert.equal(saves, 1);
  } finally {
    global.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.DEEPSEEK_API_KEY;
    else process.env.DEEPSEEK_API_KEY = originalKey;
  }
});

test('chat review allows deselection and editing before the apply request', async () => {
  const schema = await import('../src/app/lib/services/contextChanges.mjs');
  const state = [];
  let index = 0;
  const requests = [], updates = [];
  const { default: Review } = await load('src/components/document/ContextChatAction.js', {
    react: { useState: initial => { const key = index++; if (!(key in state)) state[key] = initial; return [state[key], value => { state[key] = typeof value === 'function' ? value(state[key]) : value; }]; }, useRef: () => ({ current: null }), useEffect: () => {} },
    '@/app/lib/services/contextChanges.mjs': schema,
    '@/stores/documentStore': { useDocumentStore: selector => selector({ setDocumentContext: (...args) => updates.push(args) }) },
    '@/firebase/apiFetch': { apiFetch: async (url, options) => { requests.push({ method: options.method, body: JSON.parse(options.body) }); return Response.json(options.method === 'POST' ? { changes: { goal: 'Grow', capital: '$100' }, currentContext: { goal: 'Test', capital: '$50' }, reason: 'New plans' } : { context: { goal: 'Grow slowly', capital: '$50' } }); } },
  });
  function render() { index = 0; return Review({ docId: 'model', userId: 'owner', messages: [{ role: 'user', content: 'Grow' }], disabled: false }); }
  function nodes(tree) { if (!tree || typeof tree !== 'object') return []; if (Array.isArray(tree)) return tree.flatMap(nodes); return [tree, ...nodes(tree.props?.children)]; }
  await nodes(render()).find(n => n.type === 'button').props.onClick();
  assert.equal(requests.length, 1);
  const review = nodes(render());
  review.filter(n => n.type === 'input')[1].props.onChange({ target: { checked: false } });
  review.find(n => n.props?.['aria-label'] === 'Proposed Goal').props.onChange({ target: { value: 'Grow slowly' } });
  assert.equal(requests.length, 1);
  await nodes(render()).find(n => n.type === 'button' && n.props.children === 'Apply selected changes').props.onClick();
  assert.deepEqual(requests[1].body.changes, { goal: 'Grow slowly' });
  assert.equal(updates[0][1].capital, '$50');
});
