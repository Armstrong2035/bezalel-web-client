export const targetFields = ["jobTitles", "jobLevels", "jobDepartments", "countries", "regions", "companySizes", "companyRevenues", "industries", "skills", "interests", "companyNames"];

export function defaultOpportunityForm() {
  return {
    provider: "explorium",
    prompt: "Find people who are actively thinking about better customer research and founder-led growth.",
    target: { ...Object.fromEntries(targetFields.map(field => [field, []])), jobTitles: ["Founder", "CEO"], jobLevels: ["founder", "owner"], countries: ["US"], companySizes: ["1-10", "11-50"] },
  };
}

// Validate storage shape, not research validity: unfinished and empty drafts are valid.
export function parseOpportunityForm(value) {
  if (!value || !["explorium", "bezalel", "vibe"].includes(value.provider) || typeof value.prompt !== "string" || value.prompt.length > 20000 || !value.target || typeof value.target !== "object") {
    throw new Error("Invalid opportunity form.");
  }
  const target = {};
  for (const field of targetFields) {
    const values = value.target[field] ?? [];
    if (!Array.isArray(values) || values.length > 600 || values.some(item => typeof item !== "string" || item.length > 1000)) throw new Error("Invalid target values.");
    target[field] = [...values];
  }
  const form = { provider: value.provider, prompt: value.prompt, target };
  if (JSON.stringify(form).length > 100000) throw new Error("Opportunity form is too large.");
  return form;
}

export const opportunityDraftKey = (userId, documentId) => `bezalel:opportunity-form:v1:${JSON.stringify([userId, documentId])}`;

export function createOpportunityDraft({ initialForm, storage, key, save, delay = 600 }) {
  let form;
  try { form = parseOpportunityForm(initialForm); } catch { form = defaultOpportunityForm(); }
  let dirty = false;
  try {
    const draft = storage?.getItem(key);
    if (draft) { form = parseOpportunityForm(JSON.parse(draft)); dirty = true; }
  } catch { /* Unavailable storage or an old/corrupt draft must not block editing. */ }
  let snapshot = { form, status: dirty ? "pending" : "idle", localBackup: true };
  const listeners = new Set();
  let timer;
  let running;
  let revision = 0;
  const notify = patch => { snapshot = { ...snapshot, ...patch }; listeners.forEach(fn => fn()); };
  function schedule() { clearTimeout(timer); timer = setTimeout(flush, delay); }
  function change(field, value) {
    form = { ...form, [field]: typeof value === "function" ? value(form[field]) : value };
    revision += 1;
    dirty = true;
    let localBackup = false;
    try { if (storage) { storage.setItem(key, JSON.stringify(form)); localBackup = true; } } catch { /* Cloud saving still works. */ }
    notify({ form, status: "pending", localBackup });
    schedule();
  }
  function flush() {
    clearTimeout(timer);
    if (running) return running;
    if (!dirty) return Promise.resolve();
    running = (async () => {
      while (dirty) {
        const submitted = form;
        const submittedRevision = revision;
        notify({ status: "saving" });
        try {
          await save(submitted);
          if (submittedRevision === revision) {
            dirty = false;
            try { if (storage?.getItem(key) === JSON.stringify(submitted)) storage.removeItem(key); } catch { /* Harmless leftover backup. */ }
            notify({ status: "saved" });
          }
        } catch {
          notify({ status: "error" });
          break;
        }
      }
    })().finally(() => { running = null; });
    return running;
  }
  return { change, flush, getSnapshot: () => snapshot, subscribe: fn => { listeners.add(fn); return () => listeners.delete(fn); } };
}
