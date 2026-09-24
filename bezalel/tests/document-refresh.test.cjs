const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const swc = require('next/dist/build/swc');

test('document deletion covers chat descendants and propagates deletion failures', async () => {
  const deleted = [];
  const updated = [];
  const reference = path => ({
    path,
    collection: name => reference(`${path}/${name}`),
    doc: name => reference(`${path}/${name}`),
    update: async values => updated.push({ path, values }),
  });
  const db = {
    collection: name => reference(name),
    recursiveDelete: async ref => deleted.push(ref.path),
  };
  const service = await load('src/app/lib/services/documentService.js', {
    '@/firebase/serverConfig': { db, admin: { firestore: { FieldValue: { delete: () => 'DELETE_FIELD' } } } },
  });
  await service.deleteDocument('user', 'document');
  assert.deepEqual(deleted, ['users/user/documents/document']);
  await service.clearChatHistory('user', 'document');
  assert.equal(deleted[1], 'users/user/documents/document/chat');
  assert.equal(updated[0].values.chatMemory, 'DELETE_FIELD');
  db.recursiveDelete = async () => { throw new Error('Delete failed'); };
  await assert.rejects(service.deleteDocument('user', 'document'), /Delete failed/);
  await assert.rejects(service.clearChatHistory('user', 'document'), /Delete failed/);
  assert.equal(updated.length, 1);
});

async function load(filename, overrides = {}) {
  const result = await swc.transform(fs.readFileSync(filename, 'utf8'), {
    filename, jsc: { parser: { syntax: 'ecmascript', jsx: true }, target: 'es2020' }, module: { type: 'commonjs' },
  });
  const module = { exports: {} };
  new Function('require', 'module', 'exports', result.code)(name => overrides[name] ?? require(name), module, module.exports);
  return module.exports;
}

test('cold refresh restores missing document and replaces previous canvas state', async () => {
  const { useDocumentStore: docs } = await load('src/stores/documentStore.js');
  const { useSegmentsStore: segments } = await load('src/stores/segmentsStore.js');
  docs.getState().upsertDocument({ id: 'saved', title: 'Saved business', context: { idea: 'Saved context' } });
  assert.equal(docs.getState().documents[0].context.idea, 'Saved context');
  docs.getState().upsertDocument({ id: 'saved', title: 'Updated business' });
  assert.equal(docs.getState().documents.length, 1);
  segments.getState().replaceSegments({ previous: { id: 'previous' } });
  segments.getState().replaceSegments({ restored: { id: 'restored' } });
  assert.deepEqual(Object.keys(segments.getState().segments), ['restored']);
});

test('cached empty snapshot cannot erase restored canvas; confirmed deletion can', async () => {
  let callback;
  const updates = [];
  const { subscribeToDocumentSegments } = await load('src/firebase/subscribeToDocumentSegments.js', {
    '@/firebase/config': { db: {} },
    'firebase/firestore': {
      collection: () => ({}),
      onSnapshot: (ref, options, next) => {
        assert.equal(options.includeMetadataChanges, true);
        callback = next;
        return () => {};
      },
    },
  });
  subscribeToDocumentSegments('user', 'document', data => updates.push(data));
  callback({ metadata: { fromCache: true, hasPendingWrites: false }, forEach: () => {} });
  assert.equal(updates.length, 0);
  callback({ metadata: { fromCache: false, hasPendingWrites: false }, forEach: fn => fn({ id: 'saved', data: () => ({ title: 'Saved idea' }) }) });
  assert.equal(updates[0].saved.title, 'Saved idea');
  callback({ metadata: { fromCache: false, hasPendingWrites: false }, forEach: () => {} });
  assert.deepEqual(updates[1], {});
});

test('document GET returns metadata and ideas; missing document is distinct from connection failure', async () => {
  const service = {
    getDocument: async () => ({ id: 'saved', title: 'Saved business' }),
    getDocumentCanvasIdeas: async () => [{ id: 'idea', title: 'Saved idea' }],
  };
  const { GET } = await load('src/app/api/documents/[docId]/route.js', {
    '@/app/lib/withAuth': { withAuth: handler => handler },
    '@/app/lib/services/documentService': service,
    'next/server': { NextResponse: { json: (body, init) => Response.json(body, init) } },
  });
  const request = new Request('http://localhost/api/documents/saved?userId=user');
  const params = { params: Promise.resolve({ docId: 'saved' }) };
  const response = await GET(request, params);
  const body = await response.json();
  assert.equal(body.document.title, 'Saved business');
  assert.equal(body.ideas.length, 1);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  service.getDocument = async () => null;
  assert.equal((await GET(request, params)).status, 404);
  assert.equal((await GET(new Request('http://localhost/api/documents/saved'), params)).status, 400);
  service.getDocument = async () => { throw new Error('Simulated database connection failure'); };
  const failed = await GET(request, params);
  assert.equal(failed.status, 500);
  assert.match((await failed.json()).error, /retry/);
});
