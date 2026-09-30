const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const swc = require('next/dist/build/swc');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

async function renderer() {
  const filename = 'src/components/document/ChatMarkdown.js';
  const result = await swc.transform(fs.readFileSync(filename, 'utf8'), {
    filename, jsc: { parser: { syntax: 'ecmascript', jsx: true }, target: 'es2020', transform: { react: { runtime: 'automatic' } } }, module: { type: 'commonjs' },
  });
  const mocks = {
    'react-markdown': { __esModule: true, ...await import('react-markdown') },
    'remark-gfm': { __esModule: true, ...await import('remark-gfm') },
    './ChatMarkdown.module.css': { content: 'markdown', tableScroll: 'table-scroll' },
  };
  const module = { exports: {} };
  new Function('require', 'module', 'exports', result.code)(name => mocks[name] ?? require(name), module, module.exports);
  return text => renderToStaticMarkup(React.createElement(module.exports.default, null, text));
}

test('chat formats headings, emphasis, lists, links, code and tables', async () => {
  const render = await renderer();
  const html = render('## Next steps\n\n**Focus** on *customers*.\n\n1. Interview buyers\n2. Test pricing\n\n- One\n- Two\n\n[Reference](https://example.com)\n\n`inline`\n\n```js\nconst n = 1;\n```\n\n| Task | Status |\n| --- | --- |\n| Research | Ready |');
  for (const fragment of ['<h2>Next steps</h2>', '<strong>Focus</strong>', '<em>customers</em>', '<ol>', '<ul>', '<li>Interview buyers</li>', 'href="https://example.com"', '<code>inline</code>', '<pre>', '<table>', '<th>Task</th>']) assert.ok(html.includes(fragment), fragment);
  assert.ok(!html.includes('**Focus**'));
});

test('chat renders partial streamed text and does not execute HTML or unsafe links', async () => {
  const render = await renderer();
  for (const partial of ['', '**Thinking', '```js\nconst x =', '| Task |\n| --- |']) assert.doesNotThrow(() => render(partial));
  const html = render('<script>alert(1)</script>\n\n[click](javascript:alert%281%29)\n\n<img src=x onerror=alert(1)>');
  assert.doesNotMatch(html, /<script|onerror|javascript:/);
});
