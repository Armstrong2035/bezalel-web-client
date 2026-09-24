import { test } from "node:test";
import assert from "node:assert/strict";
import { readChatEvents } from "../src/app/lib/services/readChatEvents.mjs";

function stream(text) {
  const bytes = new TextEncoder().encode(text);
  return new ReadableStream({ start(controller) {
    for (const byte of bytes) controller.enqueue(Uint8Array.of(byte));
    controller.close();
  } });
}
const event = text => `data: ${JSON.stringify({ choices: [{ delta: { content: text } }] })}\r\n\r\n`;

test("chat preserves JSON and multibyte text split across network chunks", async () => {
  const events = [];
  for await (const item of readChatEvents(stream(event("Amélie 🌍") + event(" hello") + "data: [DONE]"))) events.push(item);
  assert.equal(events.map(item => item.choices[0].delta.content).join(""), "Amélie 🌍 hello");
});

test("chat reports truncated streams instead of silently accepting partial replies", async () => {
  const received = [];
  await assert.rejects(async () => {
    for await (const item of readChatEvents(stream(event("partial")))) received.push(item);
  }, /ended early/);
  assert.equal(received.length, 1);
});

test("chat reports malformed provider data and explicit provider errors", async () => {
  for (const text of ['data: {broken}\n', 'data: {"error":{"message":"Rate limited"}}\n']) {
    await assert.rejects(async () => { for await (const item of readChatEvents(stream(text))) assert.fail(item); });
  }
});

test("stopping consumption cancels the provider stream and releases its reader", async () => {
  let cancelled = false;
  const body = new ReadableStream({
    start(controller) { controller.enqueue(new TextEncoder().encode(event("first"))); },
    cancel() { cancelled = true; },
  });
  for await (const item of readChatEvents(body)) { assert.ok(item); break; }
  assert.equal(cancelled, true);
  assert.equal(body.locked, false);
});
