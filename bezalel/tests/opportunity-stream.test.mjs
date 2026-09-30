import { test } from "node:test";
import assert from "node:assert/strict";
import { checkRun, runPipeline } from "../src/app/lib/services/opportunityPipeline.mjs";
import { readResearchStream } from "../src/app/lib/services/readResearchStream.mjs";

const person = { name: "Test Person", role: "Founder", sources: ["https://example.com/profile"], score: 70 };
const body = { provider: "bezalel", prompt: "Find founders", icp: "Founders" };
function mockClient(lines, calls) {
  return { responses: { create: async params => {
    calls.push(params);
    return (async function* () {
      yield { type: "response.output_text.delta", delta: lines.slice(0, 11) };
      yield { type: "response.output_text.delta", delta: lines.slice(11) };
      yield { type: "response.completed", response: { output: [] } };
    })();
  } } };
}
test("dataset is not required; credentials and provider are checked before spending", () => {
  assert.doesNotThrow(() => checkRun(body, { OPENAI_API_KEY: "test" }));
  assert.throws(() => checkRun({ ...body, provider: "vibe" }, { OPENAI_API_KEY: "test" }), /OAuth/);
  assert.throws(() => checkRun({ ...body, provider: "unknown" }, { OPENAI_API_KEY: "test" }), /Choose/);
});
test("web routing streams profiles, deduplicates, and caps visible results at five", async () => {
  const calls = [], events = [];
  const rows = Array.from({ length: 7 }, (_, i) => JSON.stringify({ ...person, name: `Person ${i}` }));
  rows.splice(1, 0, rows[0]);
  await runPipeline(body, e => events.push(e), new AbortController().signal, { client: mockClient(rows.join("\n"), calls) });
  assert.equal(calls[0].tools[0].type, "web_search_preview");
  assert.equal(events.filter(e => e.type === "person").length, 5);
  assert.equal(events.at(-1).type, "done");
});
test("vibe selects only remote read-only tools", async () => {
  const calls = [];
  await runPipeline({ ...body, provider: "vibe" }, () => {}, undefined, { client: mockClient(JSON.stringify(person), calls) });
  assert.equal(calls[0].tools[0].server_url, "https://vibeprospecting.explorium.ai/mcp");
  assert.deepEqual(calls[0].tools[0].allowed_tools, { read_only: true });
});
test("Explorium discovers before enriching, requests only five, and streams each profile", async () => {
  const requests = [], events = [], calls = [];
  const client = mockClient(JSON.stringify(person), calls);
  const generate = client.responses.create;
  client.responses.create = async params => params.stream ? generate(params) : { output_text: JSON.stringify({ job_title: { values: ["Founder"] } }) };
  await runPipeline({ ...body, provider: "explorium" }, e => events.push(e), undefined, {
    client, fetch: async (url, options) => {
      requests.push({ url, body: JSON.parse(options.body) });
      return Response.json({ data: url.endsWith("/v2/prospects") ? [{ prospect_id: "test", full_name: "Test Person" }] : [{ prospect_id: "test", summary: "Evidence" }] });
    },
  });
  assert.ok(requests[0].url.endsWith("/v2/prospects"));
  assert.equal(requests[0].body.page_size, 5);
  assert.equal("page" in requests[0].body, false);
  assert.equal(requests[0].body.next_cursor, null);
  assert.ok(requests[1].url.endsWith("/research/enrich"));
  assert.equal(events.filter(e => e.type === "person").length, 1);
});
function responseFor(text) {
  const bytes = new TextEncoder().encode(text);
  return new Response(new ReadableStream({ start(c) { for (const byte of bytes) c.enqueue(Uint8Array.of(byte)); c.close(); } }));
}

test("Explorium excludes saved IDs, skips old LinkedIn records and pages to new people", async () => {
  const savedId = "a".repeat(40), newId = "b".repeat(40);
  const requests = [], events = [], saved = [];
  const existingPeople = [{ prospect_id: savedId }, { name: "Old", sources: ["https://www.linkedin.com/in/old/?x=1"] }];
  await runPipeline({ ...body, provider: "explorium", target: { jobTitles: ["Founder"] } }, e => events.push(e), undefined, {
    existingPeople,
    savePerson: async person => { saved.push(person); return true; },
    client: mockClient(JSON.stringify(person), []),
    fetch: async (url, options) => {
      const payload = JSON.parse(options.body);
      requests.push({ url, payload });
      if (url.endsWith("/enrich")) return Response.json({ data: [{ summary: "Evidence" }] });
      return Response.json(payload.next_cursor ? { data: [{ prospect_id: newId }], page: { next_cursor: null } } : {
        data: [{ prospect_id: savedId }, { prospect_id: "c".repeat(40), linkedin: "https://linkedin.com/in/old" }], page: { next_cursor: "next" },
      });
    },
  });
  assert.deepEqual(requests[0].payload.exclude, [savedId]);
  assert.equal(requests[1].payload.next_cursor, "next");
  assert.equal(requests.filter(r => r.url.endsWith("/enrich")).length, 1);
  assert.equal(saved[0].prospect_id, newId);
  assert.equal(events.find(e => e.type === "person").person.prospect_id, newId);
  assert.deepEqual(events.at(-1).stats, { pages: 2, received: 3, skipped: 2, enrichmentRequests: 1 });
});

test("Explorium does not publish when a concurrent search already saved the person", async () => {
  const events = [];
  await runPipeline({ ...body, provider: "explorium", target: { jobTitles: ["Founder"] } }, e => events.push(e), undefined, {
    client: mockClient(JSON.stringify(person), []), savePerson: async () => false,
    fetch: async () => Response.json({ data: [{ prospect_id: "test" }], page: { next_cursor: "repeated" } }),
  });
  assert.equal(events.at(-1).count, 0);
  assert.equal(events.at(-1).stats.pages, 2);
  assert.equal(events.filter(e => e.type === "person").length, 0);
});

test("Explorium never emits a profile if durable history saving fails", async () => {
  const events = [];
  await assert.rejects(runPipeline({ ...body, provider: "explorium", target: { jobTitles: ["Founder"] } }, e => events.push(e), undefined, {
    client: mockClient(JSON.stringify(person), []), savePerson: async () => { throw new Error("Storage unavailable"); },
    fetch: async () => Response.json({ data: [{ prospect_id: "test" }] }),
  }), /Storage unavailable/);
  assert.equal(events.filter(e => e.type === "person").length, 0);
});
test("client decodes split JSON and UTF-8, including the final unterminated line", async () => {
  const events = [];
  await readResearchStream(responseFor(JSON.stringify({ type: "person", person: { name: "Amélie" } }) + '\n{"type":"done"}'), e => events.push(e));
  assert.equal(events[0].person.name, "Amélie");
});
test("client retains prior profiles on stream failure and detects missing completion", async () => {
  const events = [];
  await assert.rejects(readResearchStream(responseFor('{"type":"person"}\n{"type":"error","message":"Provider failed"}\n'), e => events.push(e)), /Provider failed/);
  assert.equal(events.length, 1);
  await assert.rejects(readResearchStream(responseFor('{"type":"heartbeat"}\n'), () => {}), /ended early/);
});
