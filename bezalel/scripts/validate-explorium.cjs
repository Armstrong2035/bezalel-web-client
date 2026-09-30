// Opt-in live validation: reads saved criteria and makes at most three discovery
// requests. Does not enrich prospects, save people, or change Notion records.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const swc = require('next/dist/build/swc');
require('dotenv').config({ path: ['.env.local', '.env'], quiet: true });

async function load(filename, overrides = {}) {
  const result = await swc.transform(fs.readFileSync(filename, 'utf8'), {
    filename, jsc: { parser: { syntax: 'ecmascript' }, target: 'es2020' }, module: { type: 'commonjs' },
  });
  const module = { exports: {} };
  new Function('require', 'module', 'exports', result.code)(name => overrides[name] ?? require(name), module, module.exports);
  return module.exports;
}

async function main() {
  assert.ok(process.env.EXPLORIUM_API_KEY, 'Explorium credentials are missing');
  const { targetToExploriumFilters, hasDiscoveryCriteria } = await import('../src/app/lib/services/exploriumAdapter.mjs');
  const { db } = await load('src/firebase/serverConfig.js');
  try {
    const docs = await db.collectionGroup('documents').select('opportunityForm').limit(100).get();
    const doc = docs.docs.find(doc => doc.data().opportunityForm?.provider === 'explorium' && hasDiscoveryCriteria(doc.data().opportunityForm.target));
    assert.ok(doc, 'No saved Explorium target found; no paid requests made');
    const filters = targetToExploriumFilters(doc.data().opportunityForm.target);
    const history = await doc.ref.parent.parent.collection('researchPeople').get();
    const storedIds = [...new Set(history.docs.map(doc => doc.data().prospect_id))].filter(id => /^[a-f0-9]{40}$/.test(id)).slice(0, 1000);
    console.log(JSON.stringify({ check: 'saved_target', criteria: Object.keys(filters), savedProspectIds: storedIds.length }));
    async function discover(label, exclude, cursor = null) {
      const response = await fetch(`${process.env.EXPLORIUM_API_URL || 'https://api.explorium.ai'}/v2/prospects`, {
        method: 'POST', signal: AbortSignal.timeout(45000),
        headers: { 'Content-Type': 'application/json', api_key: process.env.EXPLORIUM_API_KEY, 'credit-usage': 'true' },
        body: JSON.stringify({ mode: 'full', page_size: 5, filters, next_cursor: cursor, ...(exclude.length ? { exclude } : {}) }),
      });
      assert.equal(response.status, 200, `${label}: HTTP ${response.status}`);
      const data = await response.json();
      assert.ok(Array.isArray(data.data), 'Missing discovery records');
      assert.ok(data.data.length <= 5, 'Provider exceeded requested page size');
      const ids = data.data.map(person => person.prospect_id);
      assert.equal(ids.filter(id => exclude.includes(id)).length, 0, 'Provider returned excluded IDs');
      assert.equal(new Set(ids).size, ids.length, 'Duplicate IDs in one page');
      console.log(JSON.stringify({ check: label, requested: 5, received: ids.length, excluded: exclude.length, excludedReturned: 0, hasNextCursor: !!data.page?.next_cursor }));
      return { ids, cursor: data.page?.next_cursor };
    }
    const first = await discover('first_search', storedIds);
    assert.ok(first.ids.length, 'No matches available to validate exclusions');
    const excluded = [...new Set([...first.ids, ...storedIds])].slice(0, 1000);
    const second = await discover('repeat_search_with_exclusions', excluded);
    assert.equal(second.ids.filter(id => first.ids.includes(id)).length, 0);
    if (second.cursor) {
      const third = await discover('next_page', excluded, second.cursor);
      assert.equal(third.ids.filter(id => second.ids.includes(id)).length, 0, 'Pagination repeated the previous page');
    }
    console.log('PASS: Live discovery page size, exclusions, and available cursor pagination. No records written.');
  } finally {
    await db.terminate();
  }
}

main().catch(error => {
  console.error(JSON.stringify({ validation: 'failed', message: error.message, cause: error.cause?.code }));
  process.exitCode = 1;
});
