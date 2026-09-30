const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const swc = require('next/dist/build/swc');

async function load(filename, mocks = {}) {
  const result = await swc.transform(fs.readFileSync(filename, 'utf8'), { filename, jsc: { parser: { syntax: 'ecmascript' }, target: 'es2020' }, module: { type: 'commonjs' } });
  const module = { exports: {} };
  new Function('require', 'module', 'exports', result.code)(name => mocks[name] ?? require(name), module, module.exports);
  return module.exports;
}

test('regeneration includes custom context and preserves accepted canvas constraints', async () => {
  const pathways = await load('src/app/lib/engines/decisionEngine/pathwayPrompts.js');
  const segments = await load('src/app/lib/engines/canvasEngine/segmentPrompts.js');
  const { createPrompt } = await load('src/app/lib/engines/canvasEngine/canvasSchema.js', { '../decisionEngine/pathwayPrompts.js': pathways, './segmentPrompts.js': segments });
  const context = { idea: 'Bakery', capital: '$375', timeAvailability: '10 hours weekly', goal: 'Sell 50 loaves a week', background: 'Pastry chef' };
  const prompt = await createPrompt(context, 'valueProposition', 'owner', [{ segment: 'customerSegments', title: 'Local cafes', decisionStatus: 'now', description: 'Independent cafes nearby' }]);
  for (const value of Object.values(context)) assert.ok(prompt.includes(value), value);
  assert.ok(prompt.includes('Local cafes'));
  assert.ok(prompt.includes('Treat accepted decisions as constraints'));
  assert.ok(!prompt.includes('undefined'));
});

test('regeneration appends unaccepted ideas without deleting or replacing saved decisions', async () => {
  const existing = [{ id: 'old', accepted: true, title: 'Keep this', segment: 'channels' }];
  const saved = [];
  const { POST } = await load('src/app/api/prompt/route.js', {
    '@/app/lib/withAuth': { withAuth: handler => handler },
    '@/app/lib/engines/canvasEngine/canvasSchema': { createPrompt: async (context, segment, uid, ideas) => { assert.equal(context.goal, 'New goal'); assert.deepEqual(ideas, existing); return 'prompt'; } },
    '@/app/lib/services/llmService': { generateCanvasSegment: async () => ({ segment: 'channels', options: [{ title: 'New suggestion' }] }) },
    '@/app/lib/services/documentService': { getDocumentCanvasIdeas: async () => existing, saveIdeaToDocument: async (uid, id, idea) => { saved.push(idea); return 'new'; } },
  });
  const response = await POST(new Request('https://example.invalid/api/prompt', { method: 'POST', body: JSON.stringify({ userId: 'owner', documentId: 'model', segment: 'channels', context: { goal: 'New goal' } }) }));
  assert.equal(response.status, 200);
  assert.equal(saved[0].accepted, false);
  assert.equal(existing[0].title, 'Keep this');
  assert.equal(existing[0].accepted, true);
});
