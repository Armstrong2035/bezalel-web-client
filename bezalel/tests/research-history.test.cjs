const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const swc = require('next/dist/build/swc');

async function load(filename, overrides = {}) {
  const result = await swc.transform(fs.readFileSync(filename, 'utf8'), {
    filename, jsc: { parser: { syntax: 'ecmascript' }, target: 'es2020' }, module: { type: 'commonjs' },
  });
  const module = { exports: {} };
  new Function('require', 'module', 'exports', result.code)(name => overrides[name] ?? require(name), module, module.exports);
  return module.exports;
}

test('history persists provider identity across runs and isolates users', async () => {
  const records = new Map();
  function ref(path) {
    return {
      path, collection: name => ref(`${path}/${name}`), doc: id => ref(`${path}/${id}`),
      get: async () => ({ docs: [...records].filter(([key]) => key.startsWith(`${path}/`)).map(([, value]) => ({ data: () => value })) }),
    };
  }
  const db = {
    collection: name => ref(name),
    runTransaction: async fn => fn({
      get: async ref => ({ exists: records.has(ref.path) }),
      set: (ref, value) => records.set(ref.path, value),
    }),
  };
  const { researchHistory } = await load('src/app/lib/services/researchHistory.js', {
    '@/firebase/serverConfig': { db },
    './personIdentity.mjs': await import('../src/app/lib/services/personIdentity.mjs'),
    './notionService': { listPeopleFromNotion: async options => { assert.equal(options.all, true); return { people: [] }; } },
  });
  const person = { prospect_id: 'a'.repeat(40), name: 'Person', role: 'Founder' };
  const first = await researchHistory('alice');
  assert.equal(await first.savePerson(person), true);
  const next = await researchHistory('alice');
  assert.ok(next.existingPeople.some(p => p.prospect_id === person.prospect_id));
  assert.equal(await next.savePerson({ ...person, role: 'CEO' }), false);
  const other = await researchHistory('bob');
  assert.equal(other.existingPeople.length, 0);
  assert.equal(await other.savePerson(person), true);
});

test('duplicate lookup reads every Notion page and retains profile URLs', async () => {
  const originalFetch = global.fetch;
  const previousKey = process.env.NOTION_API_KEY, previousId = process.env.NOTION_DATABASE_ID;
  process.env.NOTION_API_KEY = 'test'; process.env.NOTION_DATABASE_ID = 'test';
  const calls = [];
  global.fetch = async (url, options) => {
    const payload = JSON.parse(options.body); calls.push(payload);
    return Response.json({ results: [{ id: payload.start_cursor || 'first', properties: { Sources: { url: 'https://linkedin.com/in/person' } } }],
      has_more: !payload.start_cursor, next_cursor: payload.start_cursor ? null : 'second' });
  };
  try {
    const { listPeopleFromNotion } = await load('src/app/lib/services/notionService.js');
    const result = await listPeopleFromNotion({ all: true });
    assert.equal(result.people.length, 2);
    assert.equal(calls[1].start_cursor, 'second');
    assert.deepEqual(result.people[1].sources, ['https://linkedin.com/in/person']);
  } finally {
    global.fetch = originalFetch;
    if (previousKey === undefined) delete process.env.NOTION_API_KEY; else process.env.NOTION_API_KEY = previousKey;
    if (previousId === undefined) delete process.env.NOTION_DATABASE_ID; else process.env.NOTION_DATABASE_ID = previousId;
  }
});
