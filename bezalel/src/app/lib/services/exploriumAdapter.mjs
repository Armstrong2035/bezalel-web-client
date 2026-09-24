import { linkedinCategories } from "./exploriumOptions.mjs";

const list = value => Array.isArray(value) ? value.filter(item => typeof item === "string").map(item => item.trim()).filter(Boolean) : [];
const canonical = (value, aliases) => {
  const trimmed = String(value).trim();
  const key = trimmed.toLowerCase();
  return Object.hasOwn(aliases, key) ? aliases[key] : trimmed;
};
const aliases = {
  jobLevels: { founder: "founder", founders: "founder", owner: "owner", owners: "owner", ceo: "c-suite", "chief executive officer": "c-suite", executive: "c-suite", "c-suite": "c-suite", vp: "vice president", "vice president": "vice president", director: "director", manager: "manager", partner: "partner" },
  jobDepartments: { marketing: "marketing", sales: "sales", product: "product", growth: "marketing", engineering: "engineering", operations: "operations", finance: "finance", hr: "human resources", "human resources": "human resources", strategy: "strategy", design: "design", data: "data", it: "it" },
  companySizes: { "1-10": "1-10", "11-50": "11-50", "51-200": "51-200", "201-500": "201-500", "501-1000": "501-1000", "1001-5000": "1001-5000", "5001-10000": "5001-10000", "10001+": "10001+" },
  countries: { "united states": "US", usa: "US", us: "US", canada: "CA", ca: "CA", nigeria: "NG", ng: "NG", "united kingdom": "GB", uk: "GB", gb: "GB" },
};

// https://developers.explorium.ai/v2/prospects/fetch_prospects
export const exploriumTargetOptions = {
  jobLevels: ["owner", "c-suite", "vice president", "director", "senior non-managerial", "manager", "partner", "non-managerial", "junior", "president", "senior manager", "advisor", "freelancer", "board member", "founder", "training", "unpaid"],
  jobDepartments: ["administration", "real estate", "healthcare", "partnerships", "c-suite", "design", "human resources", "engineering", "education", "strategy", "product", "sales", "r&d", "retail", "customer success", "security", "public service", "creative", "it", "support", "marketing", "trade", "legal", "operations", "procurement", "data", "manufacturing", "logistics", "finance"],
  companySizes: Object.keys(aliases.companySizes),
  companyRevenues: ["0-500K", "500K-1M", "1M-5M", "5M-10M", "10M-25M", "25M-75M", "75M-200M", "200M-500M", "500M-1B", "1B-10B", "10B-100B", "100B-1T", "1T-10T", "10T+"],
  industries: linkedinCategories,
};
export const targetLabels = { jobTitles: "Job titles", jobLevels: "Seniority", jobDepartments: "Departments", countries: "Countries (ISO2)", regions: "Regions (e.g. US-CA)", companySizes: "Company size", companyRevenues: "Revenue bands", industries: "Industries", skills: "Skills", interests: "Interests", companyNames: "Named companies" };
const filterFields = { job_title: "jobTitles", job_level: "jobLevels", job_department: "jobDepartments", country_code: "countries", region_country_code: "regions", company_size: "companySizes", company_revenue: "companyRevenues", linkedin_category: "industries", skills: "skills", interests: "interests", company_name: "companyNames" };
const optionSets = Object.fromEntries(Object.entries(exploriumTargetOptions).map(([field, values]) => [field, new Set(values)]));
const lowerOptionMaps = Object.fromEntries(Object.entries(exploriumTargetOptions).map(([field, values]) => [field, new Map(values.map(value => [value.toLowerCase(), value]))]));

const numericAmount = (text) => {
  const match = /^(\d+(?:\.\d+)?)([KMBT])?$/.exec(text);
  return match ? Number(match[1]) * ({ K: 1e3, M: 1e6, B: 1e9, T: 1e12 }[match[2]] || 1) : NaN;
};
const revenueRanges = exploriumTargetOptions.companyRevenues.map(band => {
  const [lower, upper] = band.replace("+", "").split("-");
  return [numericAmount(lower), upper ? numericAmount(upper) : Infinity];
});

// Split only exact unions of provider buckets. Never round an unsupported range
// outward or remove a constraint, as either would change the user's audience.
export function normalizeRevenue(value) {
  const compact = value.toUpperCase().replace(/\bUSD\b/g, "").replace(/\$/g, "")
    .replace(/\bTHOUSAND\b/g, "K").replace(/\bMILLION\b/g, "M")
    .replace(/\bBILLION\b/g, "B").replace(/\bTRILLION\b/g, "T")
    .replace(/[\u2010-\u2015\u2212]/g, "-").replace(/\s+TO\s+/g, "-").replace(/[\s,]/g, "");
  if (optionSets.companyRevenues.has(compact)) return [compact];
  let lower, upper;
  if (compact.endsWith("+")) { lower = numericAmount(compact.slice(0, -1)); upper = Infinity; }
  else {
    const parts = compact.split("-");
    if (parts.length !== 2) return [value];
    [lower, upper] = parts.map(numericAmount);
  }
  const start = revenueRanges.findIndex(range => range[0] === lower);
  const end = revenueRanges.findIndex(range => range[1] === upper);
  if (start < 0 || end < start || !(upper > lower)) return [value];
  return exploriumTargetOptions.companyRevenues.slice(start, end + 1);
}

export const targetFields = [
  "jobTitles", "jobLevels", "jobDepartments", "countries", "regions",
  "companySizes", "companyRevenues", "industries", "skills", "interests", "companyNames",
];

export function normalizeTarget(target = {}) {
  if (!target || typeof target !== "object" || Array.isArray(target)) target = {};
  const normalized = {};
  for (const field of targetFields) {
    normalized[field] = [...new Set(list(target[field]).flatMap(item => {
      if (field === "companyRevenues") return normalizeRevenue(item);
      const value = canonical(item, aliases[field] ?? {});
      if (field === "countries" || field === "regions") return [value.toUpperCase()];
      return [lowerOptionMaps[field]?.get(value.toLowerCase()) ?? value];
    }))];
  }
  return normalized;
}

export function getExploriumTargetIssues(target = {}) {
  const normalized = normalizeTarget(target);
  return Object.entries(exploriumTargetOptions).flatMap(([field]) => {
    const invalid = normalized[field].filter(value => !optionSets[field].has(value));
    return invalid.length ? [{ field, values: invalid, message: `${targetLabels[field]}: ${invalid.map(value => `"${value}"`).join(", ")} ${invalid.length === 1 ? "is not a supported value" : "are not supported values"}. Choose from the available options.` }] : [];
  });
}

export function targetToExploriumFilters(target = {}) {
  const value = normalizeTarget(target);
  const issues = getExploriumTargetIssues(value);
  if (issues.length) throw new Error(issues.map(issue => issue.message).join(" "));
  const filters = {};
  const add = (key, values, extra = {}) => { if (values.length) filters[key] = { values, ...extra }; };
  add("job_title", value.jobTitles, { include_related_job_titles: false });
  add("job_level", value.jobLevels);
  add("job_department", value.jobDepartments);
  add("country_code", value.countries.map(item => item.toUpperCase()));
  add("region_country_code", value.regions);
  add("company_size", value.companySizes);
  add("company_revenue", value.companyRevenues);
  add("linkedin_category", value.industries);
  add("skills", value.skills);
  add("interests", value.interests);
  add("company_name", value.companyNames);
  return filters;
}

export function targetToText(target = {}) {
  const value = normalizeTarget(target);
  return Object.entries(value).filter(([, items]) => items.length).map(([field, items]) => `${field}: ${items.join(", ")}`).join("; ");
}

export function hasDiscoveryCriteria(target = {}) {
  return Object.values(normalizeTarget(target)).some(values => values.length > 0);
}

// Legacy AI-generated filters must pass the same normalization/validation path.
export function normalizeExploriumFilters(filters) {
  if (!filters || typeof filters !== "object" || Array.isArray(filters)) throw new Error("Explorium target filters must be an object.");
  const target = {};
  for (const [key, filter] of Object.entries(filters)) {
    if (!Object.hasOwn(filterFields, key) || !Array.isArray(filter?.values) || !filter.values.length || filter.values.some(value => typeof value !== "string" || !value.trim())) {
      throw new Error(`Invalid Explorium filter "${key}". Review the target before researching.`);
    }
    target[filterFields[key]] = filter.values;
  }
  const normalized = targetToExploriumFilters(target);
  if (!Object.keys(normalized).length) throw new Error("Choose at least one Explorium target criterion before trying again.");
  return normalized;
}

export function formatExploriumError(status, detail) {
  let body;
  try { body = JSON.parse(detail); } catch { /* Non-JSON provider errors get a short fallback. */ }
  if (status === 422 && Array.isArray(body?.detail)) {
    const messages = body.detail.map(issue => {
      const location = Array.isArray(issue.loc) ? issue.loc : [];
      const key = location[location.indexOf("filters") + 1];
      const field = filterFields[key];
      const label = field ? `${targetLabels[field]} (${key})` : location.filter(part => part !== "body").join(".");
      const reason = String(issue.type).includes("enum") ? "choose a supported option" : String(issue.msg || "invalid value").slice(0, 200);
      return `${label || "Target"}: ${reason}`;
    });
    return `Explorium rejected the target. ${[...new Set(messages)].join("; ")}. Review these target fields and try again.`;
  }
  return `Explorium request failed (${status}): ${String(body?.detail && typeof body.detail === "string" ? body.detail : detail || "provider rejected the request").slice(0, 500)}`;
}
