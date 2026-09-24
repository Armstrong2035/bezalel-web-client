const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const swc = require('next/dist/build/swc');

async function load(filename, overrides) {
  const result = await swc.transform(fs.readFileSync(filename, 'utf8'), {
    filename, jsc: { parser: { syntax: 'ecmascript' }, target: 'es2020' }, module: { type: 'commonjs' },
  });
  const module = { exports: {} };
  new Function('require', 'module', 'exports', result.code)(name => overrides[name] ?? require(name), module, module.exports);
  return module.exports;
}

test('API verifies tokens and rejects cross-user claims before running handlers', async () => {
  let calls = 0;
  const { withAuth } = await load('src/app/lib/withAuth.js', {
    '@/firebase/serverConfig': { auth: { verifyIdToken: async token => {
      if (token !== 'valid') throw new Error('Invalid token');
      return { uid: 'alice' };
    } } },
  });
  const handle = withAuth(async (request, context, user) => {
    calls++;
    return Response.json({ uid: user.uid, body: request.method === 'POST' ? await request.json() : null });
  });
  const request = (query = '', token = 'valid', body) => new Request(`http://localhost/api/documents${query}`, {
    headers: token ? { authorization: `Bearer ${token}` } : {},
    ...(body === undefined ? {} : { method: 'POST', body: JSON.stringify(body) }),
  });
  assert.equal((await handle(request('', null))).status, 401);
  assert.equal((await handle(request('', 'expired'))).status, 401);
  assert.equal((await handle(request('?userId=bob'))).status, 403);
  assert.equal((await handle(request('?userId=alice&userId=bob'))).status, 403);
  assert.equal((await handle(request('', 'valid', { userId: 'bob' }))).status, 403);
  assert.equal((await handle(request('', 'valid', null))).status, 400);
  assert.equal(calls, 0);
  const result = await handle(request('', 'valid', { userId: 'alice', title: 'Saved' }));
  assert.equal(result.status, 200);
  assert.equal((await result.json()).body.title, 'Saved');
  assert.equal(calls, 1);
});

test('every exported API HTTP handler uses the authentication boundary', () => {
  const path = require('node:path');
  function visit(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const filename = path.join(dir, entry.name);
      if (entry.isDirectory()) visit(filename);
      else if (entry.name === 'route.js') {
        const source = fs.readFileSync(filename, 'utf8');
        assert.doesNotMatch(source, /export async function (GET|POST|PATCH|PUT|DELETE)/, filename);
        for (const [, method] of source.matchAll(/export const (GET|POST|PATCH|PUT|DELETE)\s*=/g)) {
          assert.match(source, new RegExp(`export const ${method} = withAuth\\(`), filename);
        }
      }
    }
  }
  visit('src/app/api');
});

test('browser API transport attaches a fresh user token and preserves cancellation', async () => {
  const originalFetch = global.fetch;
  const calls = [];
  global.fetch = async (input, options) => { calls.push({ input, options }); return Response.json({}); };
  try {
    const { apiFetch } = await load('src/firebase/apiFetch.js', {
      './auth': { auth: { currentUser: { getIdToken: async () => 'valid' } } },
    });
    const signal = new AbortController().signal;
    await apiFetch('/api/documents', { signal });
    assert.equal(calls[0].options.headers.get('Authorization'), 'Bearer valid');
    assert.equal(calls[0].options.signal, signal);
    await assert.rejects(apiFetch('https://example.com'), /same-origin/);
    assert.equal(calls.length, 1);
  } finally { global.fetch = originalFetch; }
});
