const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const swc = require('next/dist/build/swc');
const { renderToStaticMarkup } = require('react-dom/server');
const React = require('react');

async function load(filename, overrides = {}) {
  const result = await swc.transform(fs.readFileSync(filename, 'utf8'), {
    filename, jsc: { parser: { syntax: 'ecmascript', jsx: true }, target: 'es2020', transform: { react: { runtime: 'automatic' } } }, module: { type: 'commonjs' },
  });
  const module = { exports: {} };
  new Function('require', 'module', 'exports', result.code)(name => overrides[name] ?? require(name), module, module.exports);
  return module.exports;
}

function buttons(tree) {
  if (!tree || typeof tree !== 'object') return [];
  if (Array.isArray(tree)) return tree.flatMap(buttons);
  return [...(tree.type === 'button' ? [tree] : []), ...buttons(tree.props?.children)];
}

test('business planning opens existing canvases and creates the first model without mail', async () => {
  const { default: Planning } = await load('src/components/inbox/BusinessPlanning.js');
  const opened = [], created = [];
  const props = { documents: [], onOpen: id => opened.push(id), onCreate: title => created.push(title), creating: false };
  const empty = Planning(props);
  assert.match(renderToStaticMarkup(empty), /No business models yet/);
  buttons(empty)[0].props.onClick();
  assert.deepEqual(created, ['Untitled']);
  const existing = Planning({ ...props, documents: [{ id: 'real-document', title: 'My business' }] });
  const open = buttons(existing).find(button => button.props['aria-label'] === 'Open business model: My business');
  open.props.onClick();
  assert.deepEqual(opened, ['real-document']);
  assert.equal(buttons(Planning({ ...props, creating: true }))[0].props.disabled, true);
});

test('empty message pane has a working business planning action', async () => {
  const { default: Detail } = await load('src/components/inbox/MessageDetail.js', { '@/stores/inboxMetadata': {} });
  let opened = false;
  const tree = Detail({ message: null, onOpenPlanning: () => { opened = true; } });
  assert.match(renderToStaticMarkup(tree), /Open business planning/);
  buttons(tree)[0].props.onClick();
  assert.equal(opened, true);
});

test('real inbox store starts empty and stays empty when real activity is cleared', async () => {
  const { useInboxStore } = await load('src/stores/inboxStore.js');
  assert.deepEqual(useInboxStore.getState().messages, []);
  useInboxStore.getState().setMessages([{ id: 'real-activity', status: 'unread' }]);
  useInboxStore.getState().setMessages([]);
  assert.deepEqual(useInboxStore.getState().messages, []);
});

test('planning navigation is visible with no messages in expanded and collapsed sidebars', async () => {
  const { default: Rail } = await load('src/components/inbox/InboxRail.js', {
    '@/components/loading/NavigationLink': ({ children, ...props }) => React.createElement('a', props, children),
    '@/app/hooks/useNavigationLoading': { useLoadingRouter: () => ({ push() {} }) },
    '@/stores/inboxMetadata': { MESSAGE_TYPE_META: {} },
  });
  for (const collapsed of [false, true]) {
    const html = renderToStaticMarkup(React.createElement(Rail, { documents: [], messages: [], activeFilter: 'inbox', collapsed, onOpenPlanning() {} }));
    assert.match(html, /Business planning/);
  }
});
