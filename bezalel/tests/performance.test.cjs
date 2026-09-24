const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const swc = require('next/dist/build/swc');

async function load(filename, overrides) {
  const result = await swc.transform(fs.readFileSync(filename, 'utf8'), {
    filename, jsc: { parser: { syntax: 'ecmascript', jsx: true }, target: 'es2020' }, module: { type: 'commonjs' },
  });
  const module = { exports: {} };
  new Function('require', 'module', 'exports', result.code)(name => overrides[name], module, module.exports);
  return module.exports;
}

test('auth consumers share one listener and clear private data when the account changes', async () => {
  let callback;
  let subscriptions = 0;
  let cleanups = 0;
  const resets = [];
  const { useAuth } = await load('src/app/hooks/useAuth.js', {
    react: { useSyncExternalStore: (subscribe, getSnapshot, getServerSnapshot) => ({ subscribe, getSnapshot, getServerSnapshot }) },
    'firebase/auth': { onAuthStateChanged: (auth, next) => { subscriptions++; callback = next; return () => cleanups++; } },
    '../../firebase/auth': { auth: {} },
    '@/stores/documentStore': { useDocumentStore: { setState: state => resets.push(state) } },
    '@/stores/segmentsStore': { useSegmentsStore: { setState: () => {} } },
  });
  const first = useAuth();
  const second = useAuth();
  const stopFirst = first.subscribe(() => {});
  callback({ uid: 'first' });
  const stopSecond = second.subscribe(() => {});
  assert.equal(subscriptions, 1);
  assert.equal(second.getSnapshot().loading, false);
  assert.equal(second.getSnapshot().user.uid, 'first');
  assert.equal(second.getServerSnapshot().user, null);
  callback({ uid: 'second' });
  assert.equal(resets.length, 2);
  assert.deepEqual(resets[1].documents, []);
  assert.equal(resets[1].documentsLoaded, false);
  stopFirst();
  assert.equal(cleanups, 0);
  stopSecond();
  assert.equal(cleanups, 1);
  assert.equal(first.getSnapshot().loading, true);
});

test('document metadata and canvas reads start together', async () => {
  let resolveDocument;
  let ideasStarted = false;
  const { GET } = await load('src/app/api/documents/[docId]/route.js', {
    '@/app/lib/withAuth': { withAuth: handler => handler },
    'next/server': { NextResponse: { json: (body, init) => Response.json(body, init) } },
    '@/app/lib/services/documentService': {
      getDocument: () => new Promise(resolve => { resolveDocument = resolve; }),
      getDocumentCanvasIdeas: async () => { ideasStarted = true; return []; },
    },
  });
  const pending = GET(new Request('http://localhost/api/documents/doc?userId=user'), { params: Promise.resolve({ docId: 'doc' }) });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(ideasStarted, true);
  resolveDocument({ id: 'doc' });
  assert.equal((await pending).status, 200);
});
