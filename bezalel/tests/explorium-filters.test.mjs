import { test } from "node:test";
import assert from "node:assert/strict";
import { exploriumTargetOptions, formatExploriumError, getExploriumTargetIssues, normalizeExploriumFilters, normalizeTarget, targetToExploriumFilters } from "../src/app/lib/services/exploriumAdapter.mjs";
import { checkRun, runPipeline } from "../src/app/lib/services/opportunityPipeline.mjs";

test("revenue case, currency, Unicode dashes and exact combined ranges become valid buckets", () => {
  const target = normalizeTarget({ companyRevenues: ["$1 million – $10 million", "0-1m", "USD 500,000 - USD 1,000,000"] });
  assert.deepEqual(target.companyRevenues, ["1M-5M", "5M-10M", "0-500K", "500K-1M"]);
  assert.deepEqual(normalizeTarget({ companyRevenues: ["1B+"] }).companyRevenues,
    ["1B-10B", "10B-100B", "100B-1T", "1T-10T", "10T+"]);
  for (const band of exploriumTargetOptions.companyRevenues) {
    assert.deepEqual(targetToExploriumFilters({ companyRevenues: [band] }).company_revenue.values, [band]);
  }
});

test("canonical industry spelling is preserved, including category commas", () => {
  const filters = targetToExploriumFilters({ industries: ["Software Development", "Retail", "Technology, Information and Internet"] });
  assert.deepEqual(filters.linkedin_category.values, ["software development", "retail", "technology, information and internet"]);
  assert.equal(exploriumTargetOptions.industries.length, 523);
});

test("ambiguous revenue ranges and industries are rejected without dropping or broadening constraints", () => {
  const target = { companyRevenues: ["2M-10M"], industries: ["SaaS"] };
  assert.deepEqual(normalizeTarget(target).companyRevenues, ["2M-10M"]);
  const issues = getExploriumTargetIssues(target);
  assert.deepEqual(issues.map(issue => issue.field), ["companyRevenues", "industries"]);
  assert.throws(() => targetToExploriumFilters(target), /Revenue bands:.*2M-10M.*Industries:.*SaaS/);
  assert.throws(() => targetToExploriumFilters({ companyRevenues: ["EUR 1M-5M"] }), /not a supported/);
});

test("invalid enum fields fail preflight; other providers retain their free-form targets", () => {
  const body = { prompt: "Find founders", target: { industries: ["SaaS"], companyRevenues: ["small businesses"] } };
  const env = { OPENAI_API_KEY: "test", EXPLORIUM_API_KEY: "test" };
  assert.throws(() => checkRun({ ...body, provider: "explorium" }, env), /Revenue bands:.*Industries:/);
  assert.doesNotThrow(() => checkRun({ ...body, provider: "bezalel" }, env));
});

test("seniority and department enums normalize supported aliases and reject unknown values", () => {
  const filters = targetToExploriumFilters({ jobLevels: ["CEO", "Board Member"], jobDepartments: ["HR", "R&D"] });
  assert.deepEqual(filters.job_level.values, ["c-suite", "board member"]);
  assert.deepEqual(filters.job_department.values, ["human resources", "r&d"]);
  assert.throws(() => targetToExploriumFilters({ jobLevels: ["very senior"] }), /Seniority/);
  assert.throws(() => targetToExploriumFilters({ industries: ["constructor", "__proto__"] }), /Industries/);
});

test("legacy filter JSON uses the same validation and rejects unknown keys or invalid shapes", () => {
  const filters = normalizeExploriumFilters({ company_revenue: { values: ["0-1m"] }, linkedin_category: { values: ["Software Development"] } });
  assert.deepEqual(filters.company_revenue.values, ["0-500K", "500K-1M"]);
  assert.deepEqual(filters.linkedin_category.values, ["software development"]);
  for (const input of [null, [], {}, { unknown: { values: ["x"] } }, { job_title: { values: [2] } }]) {
    assert.throws(() => normalizeExploriumFilters(input));
  }
});

test("422 errors identify every rejected field instead of truncating the second one", () => {
  const detail = JSON.stringify({ detail: [
    { loc: ["body", "filters", "company_revenue", "values", 0], type: "type_error.enum", msg: "invalid enumeration " + "x".repeat(1000) },
    { loc: ["body", "filters", "linkedin_category", "values", 0], type: "type_error.enum", msg: "invalid enumeration" },
  ] });
  const message = formatExploriumError(422, detail);
  assert.match(message, /Revenue bands \(company_revenue\)/);
  assert.match(message, /Industries \(linkedin_category\)/);
  assert.doesNotMatch(message, /x{10}/);
  assert.match(formatExploriumError(503, "Unavailable"), /503.*Unavailable/);
});

test("both structured and legacy invalid filters are stopped before any Explorium request", async () => {
  let requests = 0;
  const deps = {
    fetch: async () => { requests++; return Response.json({ data: [] }); },
    client: { responses: { create: async () => ({ output_text: JSON.stringify({ company_revenue: { values: ["2M-10M"] }, linkedin_category: { values: ["SaaS"] } }) }) } },
  };
  for (const target of [{ industries: ["SaaS"] }, undefined]) {
    await assert.rejects(runPipeline({ provider: "explorium", prompt: "Find founders", icp: "SaaS founders", target }, () => {}, undefined, deps), /Industries/);
  }
  assert.equal(requests, 0);
});

test("the discovery request carries normalized enums for both input paths", async () => {
  for (const target of [{ companyRevenues: ["0-1m"], industries: ["Software Development"] }, undefined]) {
    let submitted;
    await runPipeline({ provider: "explorium", prompt: "Find founders", icp: "Software founders", target }, () => {}, undefined, {
      fetch: async (url, options) => { submitted = JSON.parse(options.body); return Response.json({ data: [] }); },
      client: { responses: { create: async () => ({ output_text: JSON.stringify({ company_revenue: { values: ["0-1m"] }, linkedin_category: { values: ["Software Development"] } }) }) } },
    });
    assert.deepEqual(submitted.filters.company_revenue.values, ["0-500K", "500K-1M"]);
    assert.deepEqual(submitted.filters.linkedin_category.values, ["software development"]);
    assert.equal(submitted.page_size, 5);
  }
});
