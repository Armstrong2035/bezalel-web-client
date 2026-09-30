const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const swc = require('next/dist/build/swc');

test('canvas and business brief generation use DeepSeek directly and preserve JSON', async () => {
  const config = await import('../src/app/lib/services/deepseekConfig.mjs');
  const result = await swc.transform(fs.readFileSync('src/app/lib/services/llmService.js', 'utf8'), {
    filename: 'llmService.js', jsc: { parser: { syntax: 'ecmascript' }, target: 'es2020' }, module: { type: 'commonjs' },
  });
  const module = { exports: {} };
  new Function('require', 'module', 'exports', result.code)(() => config, module, module.exports);
  const { generateCanvasSegment } = module.exports;
  const oldFetch = global.fetch;
  const oldKey = process.env.DEEPSEEK_API_KEY, oldModel = process.env.DEEPSEEK_MODEL;
  const calls = [];
  try {
    delete process.env.DEEPSEEK_API_KEY;
    global.fetch = async (...args) => { calls.push(args); return Response.json({ choices: [{ message: { content: '{"options":[]}' } }] }); };
    await assert.rejects(generateCanvasSegment('Return JSON'), /DEEPSEEK_API_KEY/);
    assert.equal(calls.length, 0);
    process.env.DEEPSEEK_API_KEY = 'test'; delete process.env.DEEPSEEK_MODEL;
    assert.deepEqual(await generateCanvasSegment('Return JSON'), { options: [] });
    assert.equal(calls[0][0], 'https://api.deepseek.com/chat/completions');
    const payload = JSON.parse(calls[0][1].body);
    assert.equal(payload.model, 'deepseek-flash');
    assert.deepEqual(payload.response_format, { type: 'json_object' });
    assert.deepEqual(payload.thinking, { type: 'disabled' });
    process.env.DEEPSEEK_MODEL = 'custom-model';
    await generateCanvasSegment('Return JSON');
    assert.equal(JSON.parse(calls[1][1].body).model, 'custom-model');
    global.fetch = async () => Response.json({ error: { message: 'Unavailable' } }, { status: 503 });
    await assert.rejects(generateCanvasSegment('Return JSON'), /DeepSeek 503/);
    global.fetch = async () => Response.json({ choices: [{ message: { content: '' } }] });
    await assert.rejects(generateCanvasSegment('Return JSON'), /no text/);
    global.fetch = async () => Response.json({ choices: [{ finish_reason: 'length', message: { content: '{"partial":true}' } }] });
    await assert.rejects(generateCanvasSegment('Return JSON'), /truncated/);
    global.fetch = async () => Response.json({ choices: [{ message: { content: 'not JSON' } }] });
    await assert.rejects(generateCanvasSegment('Return JSON'), SyntaxError);
  } finally {
    global.fetch = oldFetch;
    if (oldKey === undefined) delete process.env.DEEPSEEK_API_KEY; else process.env.DEEPSEEK_API_KEY = oldKey;
    if (oldModel === undefined) delete process.env.DEEPSEEK_MODEL; else process.env.DEEPSEEK_MODEL = oldModel;
  }
});
