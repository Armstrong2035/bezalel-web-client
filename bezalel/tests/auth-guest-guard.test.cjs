const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const swc = require('next/dist/build/swc');

test('auth pages wait for the session and replace history only for signed-in users', async () => {
  const filename = 'src/components/auth/AuthGuestGuard.js';
  const result = await swc.transform(fs.readFileSync(filename, 'utf8'), {
    filename,
    jsc: { parser: { syntax: 'ecmascript', jsx: true }, target: 'es2020', transform: { react: { runtime: 'automatic' } } },
    module: { type: 'commonjs' },
  });
  let session;
  const effects = [], replacements = [];
  const Loading = () => null;
  const mocks = {
    react: { useEffect: effect => effects.push(effect) },
    'next/navigation': { useRouter: () => ({ replace: path => replacements.push(path) }) },
    '@/app/hooks/useAuth': { useAuth: () => session },
    '@/components/loading/RouteLoading': Loading,
  };
  const module = { exports: {} };
  new Function('require', 'module', 'exports', result.code)(name => mocks[name] ?? require(name), module, module.exports);
  const Guard = module.exports.default;
  for (const state of [
    { user: null, loading: true },
    { user: null, loading: false },
    { user: { uid: 'signed-in' }, loading: false },
  ]) {
    session = state;
    const rendered = Guard({ children: 'Sign-in form' });
    if (state.loading || state.user) assert.equal(rendered.type, Loading);
    else assert.equal(rendered, 'Sign-in form');
    effects.splice(0).forEach(effect => effect());
    assert.deepEqual(replacements, state.user ? ['/documents'] : []);
  }
});
