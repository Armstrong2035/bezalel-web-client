import { test } from "node:test";
import assert from "node:assert/strict";
import { createOpportunityDraft, defaultOpportunityForm, parseOpportunityForm, opportunityDraftKey } from "../src/app/lib/opportunityForm.mjs";

function memoryStorage() {
  const data = new Map();
  return { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value), removeItem: key => data.delete(key) };
}

test("restores server form without overwriting it with defaults or saving on mount", async () => {
  const form = defaultOpportunityForm();
  form.prompt = "";
  form.target.jobTitles = [];
  let saves = 0;
  const draft = createOpportunityDraft({ initialForm: form, save: async () => saves++ });
  await draft.flush();
  assert.deepEqual(draft.getSnapshot().form, form);
  assert.equal(saves, 0);
});

test("backs up edits immediately, restores after refresh, and removes backup after cloud save", async () => {
  const storage = memoryStorage();
  const key = opportunityDraftKey("alice", "doc1");
  const draft = createOpportunityDraft({ storage, key, save: async () => { throw Error("offline"); } });
  draft.change("provider", "bezalel");
  draft.change("prompt", "Unsaved work");
  assert.equal(JSON.parse(storage.getItem(key)).prompt, "Unsaved work");
  await draft.flush();
  assert.equal(draft.getSnapshot().status, "error");
  const saved = [];
  const restored = createOpportunityDraft({ storage, key, save: async form => saved.push(form) });
  assert.equal(restored.getSnapshot().form.provider, "bezalel");
  await restored.flush();
  assert.equal(saved[0].prompt, "Unsaved work");
  assert.equal(restored.getSnapshot().status, "saved");
  assert.equal(storage.getItem(key), null);
});

test("serializes saves so an older response cannot drop edits made during a save", async () => {
  const storage = memoryStorage();
  let finish;
  const saved = [];
  const draft = createOpportunityDraft({ storage, key: "draft", save: async form => {
    saved.push(form.prompt);
    if (saved.length === 1) await new Promise(resolve => { finish = resolve; });
  } });
  draft.change("prompt", "first");
  const pending = draft.flush();
  draft.change("prompt", "latest");
  assert.equal(draft.flush(), pending);
  finish();
  await pending;
  assert.deepEqual(saved, ["first", "latest"]);
  assert.equal(storage.getItem("draft"), null);
});

test("isolates accounts and documents, and ignores corrupt local drafts", () => {
  const keys = [opportunityDraftKey("alice", "a"), opportunityDraftKey("bob", "a"), opportunityDraftKey("alice", "b")];
  assert.equal(new Set(keys).size, 3);
  const storage = memoryStorage();
  storage.setItem(keys[0], "broken JSON");
  assert.deepEqual(createOpportunityDraft({ storage, key: keys[0] }).getSnapshot().form, defaultOpportunityForm());
});

test("storage failures do not prevent cloud saving and failed saves can be retried", async () => {
  let offline = true;
  const draft = createOpportunityDraft({ storage: { getItem() { throw Error(); }, setItem() { throw Error(); } }, save: async () => { if (offline) throw Error(); } });
  draft.change("prompt", "keep me");
  assert.equal(draft.getSnapshot().localBackup, false);
  await draft.flush();
  assert.equal(draft.getSnapshot().status, "error");
  offline = false;
  await draft.flush();
  assert.equal(draft.getSnapshot().status, "saved");
});

test("draft validation accepts unfinished criteria but rejects malformed and oversized data", () => {
  const form = defaultOpportunityForm();
  form.target.companyRevenues = ["unfinished"];
  assert.deepEqual(parseOpportunityForm({ ...form, unexpected: "discard" }), form);
  assert.throws(() => parseOpportunityForm({ ...form, provider: "unknown" }));
  assert.throws(() => parseOpportunityForm({ ...form, prompt: "x".repeat(20001) }));
  assert.throws(() => parseOpportunityForm({ ...form, target: { jobTitles: "CEO" } }));
});

test("save endpoint writes only the validated form to the authenticated user's existing document", async () => {
  const { readFileSync } = await import("node:fs");
  const { default: swc } = await import("next/dist/build/swc/index.js");
  const filename = "src/app/api/documents/[docId]/opportunity-form/route.js";
  const result = await swc.transform(readFileSync(filename, "utf8"), { filename, jsc: { parser: { syntax: "ecmascript" }, target: "es2020" }, module: { type: "commonjs" } });
  const writes = [];
  let missing = false;
  const overrides = {
    "next/server": { NextResponse: Response },
    "@/app/lib/withAuth": { withAuth: handler => handler },
    "@/app/lib/opportunityForm.mjs": { parseOpportunityForm },
    "@/app/lib/services/documentService": { updateDocument: async (...args) => { if (missing) throw { code: 5 }; writes.push(args); } },
  };
  const module = { exports: {} };
  new Function("require", "module", "exports", result.code)(name => overrides[name], module, module.exports);
  const request = form => new Request("https://example.test/api/documents/doc1/opportunity-form", { method: "PUT", body: JSON.stringify({ form }) });
  const context = { params: Promise.resolve({ docId: "doc1" }) };
  const form = defaultOpportunityForm();
  assert.equal((await module.exports.PUT(request(form), context, { uid: "alice" })).status, 200);
  assert.deepEqual(writes, [["alice", "doc1", { opportunityForm: form }]]);
  assert.equal((await module.exports.PUT(request({}), context, { uid: "alice" })).status, 400);
  assert.equal(writes.length, 1);
  missing = true;
  assert.equal((await module.exports.PUT(request(form), context, { uid: "alice" })).status, 404);
});
