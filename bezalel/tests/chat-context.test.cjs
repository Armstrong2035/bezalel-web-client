const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const swc = require('next/dist/build/swc');

async function load(filename, mocks = {}) {
  const result = await swc.transform(fs.readFileSync(filename, 'utf8'), {
    filename, jsc: { parser: { syntax: 'ecmascript' }, target: 'es2020' }, module: { type: 'commonjs' },
  });
  const module = { exports: {} };
  new Function('require', 'module', 'exports', result.code)(name => mocks[name] ?? require(name), module, module.exports);
  return module.exports;
}

test('chat context uses saved data for the current model and distinguishes unavailable features', async () => {
  const calls = [];
  const service = await load('src/app/lib/services/chatContext.js', {
    './documentService': {
      getDocument: async (...args) => { calls.push(args); return { title: 'Bakery', context: { idea: 'Bread', capital: '$500', timeAvailability: 'Weekends' }, chatMemory: { summary: 'Prior chat' } }; },
      getDocumentCanvasIdeas: async (...args) => { calls.push(args); return [{ id: 'idea', decisionStatus: 'now' }]; },
    },
    './activityService': { listActivities: async uid => { assert.equal(uid, 'owner'); return [{ documentId: 'model', subject: 'Relevant' }, { documentId: 'other', subject: 'Unrelated' }]; } },
    './automationService': { getAutomation: async () => ({ enabled: true }) },
    './digestService': { getDigestSettings: async () => { throw new Error('Offline'); } },
  });
  const result = await service.loadChatContext('owner', 'model');
  assert.deepEqual(calls, [['owner', 'model'], ['owner', 'model']]);
  assert.equal(result.snapshot.context.capital, '$500');
  assert.equal(result.snapshot.ideas[0].decisionStatus, 'now');
  assert.equal(result.features.recentDocumentActivity.data.length, 1);
  assert.equal(result.features.recentDocumentActivity.data[0].subject, 'Relevant');
  assert.deepEqual(result.features.digest, { status: 'unavailable' });
});

test('missing models do not trigger additional context reads', async () => {
  const service = await load('src/app/lib/services/chatContext.js', {
    './documentService': { getDocument: async () => null },
    './activityService': {}, './automationService': {}, './digestService': {},
  });
  assert.equal(await service.loadChatContext('owner', 'missing'), null);
});

test('chat sends Bezalel capabilities and saved context to the model, ignoring browser snapshots', async () => {
  const engine = await load('src/app/lib/engines/canvasEngine/canvasReasoning.js');
  const prompt = await load('src/app/lib/services/chatSystemPrompt.js', { '../engines/canvasEngine/canvasReasoning': engine });
  const saved = { snapshot: { title: 'Bakery', context: { idea: 'Bread', capital: '$500', timeAvailability: 'Weekends', background: 'Baker' }, ideas: [] }, features: { digest: { status: 'available', data: { paused: true } } } };
  const previousKey = process.env.DEEPSEEK_API_KEY;
  process.env.DEEPSEEK_API_KEY = 'test-only';
  let sent;
  const originalFetch = global.fetch;
  global.fetch = async (url, options) => { sent = JSON.parse(options.body); return new Response('data: [DONE]\n\n'); };
  try {
    const route = await load('src/app/api/chat/route.js', {
      '@/app/lib/services/deepseekConfig.mjs': { DEEPSEEK_URL: 'https://example.invalid', getDeepSeekModel: () => 'test' },
      '@/app/lib/withAuth': { withAuth: handler => handler },
      'next/server': { NextResponse: { json: Response.json } },
      '@/app/lib/engines/canvasEngine/canvasReasoning': engine,
      '@/app/lib/services/documentService': { saveChatMessage: async () => {} },
      '@/app/lib/services/readChatEvents.mjs': await import('../src/app/lib/services/readChatEvents.mjs'),
      '@/app/lib/services/chatContext': { loadChatContext: async (uid, id) => { assert.equal(uid, 'owner'); assert.equal(id, 'model'); return saved; } },
      '@/app/lib/services/chatSystemPrompt': prompt,
    });
    const response = await route.POST(new Request('https://example.invalid/api/chat', { method: 'POST', body: JSON.stringify({ userId: 'owner', documentId: 'model', messages: [{ role: 'user', content: 'What can we do here?' }], documentSnapshot: { context: { idea: 'STALE CLIENT DATA' } } }) }));
    assert.equal(response.status, 200);
    await response.text();
    const system = sent.messages[0].content;
    for (const value of ['business cofounder', 'Business planning', 'Outreach', 'Digest', 'Context editor', '$500', 'Weekends', 'Baker', '"paused":true', 'no tools']) assert.ok(system.includes(value), value);
    assert.ok(!system.includes('STALE CLIENT DATA'));
  } finally {
    global.fetch = originalFetch;
    if (previousKey === undefined) delete process.env.DEEPSEEK_API_KEY;
    else process.env.DEEPSEEK_API_KEY = previousKey;
  }
});
