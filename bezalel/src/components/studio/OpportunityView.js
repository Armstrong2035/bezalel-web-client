"use client";

import { useOpportunityForm } from "@/app/hooks/useOpportunityForm";
import { apiFetch } from "@/firebase/apiFetch";

import { useState, useRef, useEffect } from "react";
import { readResearchStream } from "@/app/lib/services/readResearchStream.mjs";
import { exploriumTargetOptions, getExploriumTargetIssues, normalizeTarget, targetLabels } from "@/app/lib/services/exploriumAdapter.mjs";
import NotionPeopleList from "./NotionPeopleList";

const splitValues = value => value.split(",").map(item => item.trim()).filter(Boolean);

export default function OpportunityView({ canvasIdeas = [], documentId, initialForm }) {
  const draft = useOpportunityForm(documentId, initialForm);
  const { prompt, target, provider } = draft.form;
  const setPrompt = value => draft.change("prompt", value);
  const setTarget = value => draft.change("target", value);
  const setProvider = value => draft.change("provider", value);
  const [progress, setProgress] = useState("");
  const abortRef = useRef(null);
  useEffect(() => () => abortRef.current?.abort(), []);
  const [people, setPeople] = useState([]);
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [targetMessage, setTargetMessage] = useState("");
  const [targetStatus, setTargetStatus] = useState("idle");
  const [deeper, setDeeper] = useState(null);
  const [deepStatus, setDeepStatus] = useState("idle");
  const [sent, setSent] = useState(false);
  const [view, setView] = useState("research");
  const [automation, setAutomation] = useState({ loading: true, enabled: false });
  useEffect(() => {
    if (!documentId) {
      setAutomation({ loading: false, enabled: false });
      return;
    }
    let active = true;
    apiFetch(`/api/documents/${encodeURIComponent(documentId)}/automation`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("load failed"))))
      .then((data) => {
        if (active) setAutomation({ loading: false, enabled: !!data.automation?.enabled });
      })
      .catch(() => {
        if (active) setAutomation({ loading: false, enabled: false });
      });
    return () => {
      active = false;
    };
  }, [documentId]);

  const toggleAutomation = async () => {
    if (!documentId || automation.loading) return;
    const next = !automation.enabled;
    setAutomation((current) => ({ ...current, enabled: next }));
    try {
      await apiFetch(`/api/documents/${encodeURIComponent(documentId)}/automation`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: next }),
      });
    } catch {
      setAutomation((current) => ({ ...current, enabled: !next }));
    }
  };
  const targetIssues = provider === "explorium" ? getExploriumTargetIssues(target) : [];

  async function generateTargetFromCanvas() {
    const activeIdeas = canvasIdeas.filter((idea) => (idea.decisionStatus ?? (idea.accepted ? "now" : "explore")) === "now");
    const targetIdeas = activeIdeas.filter((idea) => idea.segment === "customerSegments" || idea.segment === "valueProposition").map(({ id, segment, title, description }) => ({ id, segment, title, description }));
    if (!targetIdeas.length) {
      setTargetMessage("Add at least one Customer Segment or Value Proposition marked Now.");
      return;
    }
    setTargetStatus("loading");
    setTargetMessage("");
    try {
      const response = await apiFetch("/api/opportunities/target", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ideas: targetIdeas }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not generate target.");
      if (result.target) setTarget(result.target);
      setPrompt(result.researchIntent);
      setTargetMessage("Generated from your active Customer Segments and Value Propositions. Review before running research.");
      setTargetStatus("ready");
    } catch (generationError) {
      setTargetMessage(generationError.message);
      setTargetStatus("error");
    }
  }

  async function run(event) {
    event.preventDefault();
    if (status === "loading" || deepStatus === "loading") return;
    const hasTarget = Object.values(target).some(values => values.length);
    if (!prompt.trim() || !hasTarget) { setError("Add at least one target criterion, such as a role, country, or company size."); return; }
    if (targetIssues.length) { setError(targetIssues.map(issue => issue.message).join(" ")); return; }
    const submittedTarget = provider === "explorium" ? normalizeTarget(target) : target;
    setTarget(submittedTarget);
    const controller = new AbortController();
    abortRef.current = controller;
    setStatus("loading"); setError(""); setPeople([]); setSelected(null); setDeeper(null); setSent(false);
    setProgress("Connecting to selected provider…");
    try {
      const response = await apiFetch("/api/opportunities/research", {
        method: "POST", signal: controller.signal, headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, prompt, target: submittedTarget }),
      });
      await readResearchStream(response, event => {
        if (event.type === "progress" || event.type === "done") setProgress(event.message);
        if (event.type === "person") {
          setPeople(current => [...current, event.person]);
          setSelected(current => current || event.person);
        }
      });
      setStatus("ready");
    } catch (err) {
      setError(err.name === "AbortError" ? "Research stopped. Completed profiles are retained. Provider work already submitted may still incur charges." : err.message);
      setStatus("error");
    } finally { abortRef.current = null; }
  }

  async function goDeeper() {
    if (!selected || status === "loading" || deepStatus === "loading") return;
    const controller = new AbortController();
    abortRef.current = controller;
    setDeepStatus("loading"); setError(""); setDeeper(null);
    try {
      const response = await apiFetch("/api/opportunities/research", {
        method: "POST", signal: controller.signal, headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deeper", person: selected, prompt, target }),
      });
      await readResearchStream(response, event => {
        if (event.type === "progress") setProgress(event.message);
        if (event.type === "person") setDeeper({ summary: event.person.summary, findings: [{ title: "Public signal", detail: event.person.signal, source: event.person.sources.join(" · ") }] });
      });
      setDeepStatus("ready");
    } catch (err) { setError(err.name === "AbortError" ? "Research stopped." : err.message); setDeepStatus("error"); }
    finally { abortRef.current = null; }
  }

  return (
    <section style={styles.wrap}>
      <div style={tabStyles.bar}>
        <button onClick={() => setView("research")} style={{ ...tabStyles.tab, ...(view === "research" ? tabStyles.active : {}) }}>Research</button>
        <button onClick={() => setView("notion")} style={{ ...tabStyles.tab, ...(view === "notion" ? tabStyles.active : {}) }}>Notion</button>
      </div>
      {view === "notion" ? (
        <NotionPeopleList />
      ) : (
      <>
      <div style={styles.hero}><div><p style={styles.eyebrow}>OPPORTUNITY SERVICE · PEOPLE INTELLIGENCE</p><h2 style={styles.title}>Show me you know me.</h2><p style={styles.intro}>Choose who finds and enriches your prospects. Review evidence and ICP fit as profiles arrive.</p>{documentId && <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 16 }}><button type="button" role="switch" aria-checked={automation.enabled} onClick={toggleAutomation} style={{ width: 38, height: 22, borderRadius: 99, border: "none", background: automation.enabled ? "#1a1a1a" : "#d4d4d2", cursor: "pointer", position: "relative", padding: 0, flexShrink: 0, transition: "background 0.15s" }}><span style={{ position: "absolute", top: 3, left: automation.enabled ? 19 : 3, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left 0.15s" }} /></button><span style={{ fontSize: 13, color: "#444", fontWeight: 600 }}>{automation.loading ? "Checking automation…" : automation.enabled ? "Daily digest is on" : "Automate daily outreach"}</span></div>}</div><span style={styles.pill}>{status === "loading" ? "Researching" : "Credit-safe pilot"}</span></div>
      <form onSubmit={run} style={styles.form}>
        <div role="status" aria-live="polite" style={{ ...styles.hint, marginBottom: 12 }}>
          {!draft.ready ? "Restoring form..." : !draft.persistent ? "Open a document to save this form." : draft.status === "error" ? (draft.localBackup ? "Saved on this device. Could not sync to your account." : "Could not save your changes. Keep this page open and retry.") : draft.status === "saving" || draft.status === "pending" ? "Saving..." : draft.status === "saved" ? "All changes saved" : "Changes save automatically"}
          {draft.status === "error" && <button type="button" onClick={draft.retry} style={{ ...styles.secondary, marginLeft: 12 }}>Retry save</button>}
        </div>
        <fieldset disabled={!draft.ready} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
        <fieldset style={{ border: "1px solid #e8e8e6", borderRadius: 8, padding: 14, margin: "0 0 20px", minWidth: 0, background: "#fff", color: "#1a1a1a" }} disabled={status === "loading" || deepStatus === "loading"}>
          <legend style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a", padding: "0 6px" }}>Choose your research provider</legend>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {[
              ["explorium", "Explorium", "Find and enrich professional profiles"],
              ["bezalel", "Bezalel", "Find people and research public sources"],
              ["vibe", "Vibe Prospecting", "Requires a Vibe OAuth connection"],
            ].map(([value, label, detail]) => (
              <label key={value} style={{ flex: "1 1 170px", display: "flex", alignItems: "flex-start", gap: 8, padding: 12, borderRadius: 7, border: provider === value ? "2px solid #2563eb" : "2px solid #e8e8e6", background: provider === value ? "#eff6ff" : "#fff", color: "#1a1a1a", cursor: "pointer" }}>
                <input type="radio" name="research-provider" value={value} checked={provider === value} onChange={() => setProvider(value)} style={{ marginTop: 3, accentColor: "#2563eb" }} />
                <span><strong style={{ display: "block", fontSize: 13 }}>{label}</strong><small style={{ display: "block", marginTop: 5, color: "#555", lineHeight: 1.5 }}>{detail}</small></span>
              </label>
            ))}
          </div>
        </fieldset>
        <div style={styles.formHeading}><p style={styles.heading}>01 · DEFINE THE OPPORTUNITY</p><button type="button" onClick={generateTargetFromCanvas} disabled={targetStatus === "loading"} style={styles.generate}>{targetStatus === "loading" ? "Generating…" : "Generate target from canvas"}</button></div>
        <p style={styles.canvasHint}>Uses your Customer Segments and Value Propositions.</p>
        <label style={styles.label}>Research intent</label><textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} rows={3} style={styles.textarea} />
        <label style={styles.label}>Pre-approved target</label>
        <div style={styles.targetGrid}>
          {Object.entries(targetLabels).map(([field, label]) => (
            provider === "explorium" && exploriumTargetOptions[field] ? (
              <TargetOptions key={field} field={field} label={label} values={target[field] || []}
                issue={targetIssues.find(issue => issue.field === field)}
                onChange={values => setTarget(current => ({ ...current, [field]: values }))} />
            ) : (
              <label key={field} style={styles.targetField}><span>{label}</span><input value={(target[field] || []).join(", ")} onChange={(event) => setTarget(current => ({ ...current, [field]: splitValues(event.target.value) }))} placeholder="Comma-separated" style={styles.input} /></label>
            )
          ))}
        </div>
        {targetMessage && <p style={styles.success}>{targetMessage}</p>}
        <p style={styles.hint}>Finds people from your target. No dataset needed. Vibe requires its own connected account.</p>
        <div style={styles.footer}><span style={styles.hint}>Returns up to five people. Uses the selected provider.</span><button disabled={status === "loading" || deepStatus === "loading" || targetStatus === "loading"} style={styles.primary}>{status === "loading" ? "Researching…" : `Find five people with ${{ explorium: "Explorium", bezalel: "Bezalel", vibe: "Vibe Prospecting" }[provider]} →`}</button></div>
        {(status === "loading" || deepStatus === "loading") && <button type="button" onClick={() => abortRef.current?.abort()} style={styles.secondary}>Stop research</button>}
        {progress && <p role="status" aria-live="polite" style={styles.hint}>{progress}</p>}
        {error && <p role="alert" style={styles.error}>{error}</p>}
        </fieldset>
      </form>
      {status === "idle" && <div style={styles.empty}><p style={styles.eyebrow}>THE OUTPUT</p><h3>Evidence first. Judgment stays with you.</h3><p>Each result shows its provider, supporting evidence, ICP score, and an optional deeper-research action.</p></div>}
      {people.length > 0 && <div style={styles.results}><div style={styles.resultHead}><div><p style={styles.heading}>02 · RESEARCH INBOX</p><h3>Worth knowing now</h3><p style={styles.hint}>Provider evidence and ICP assessment are shown for every profile.</p></div><button onClick={() => setSent(true)} style={styles.secondary}>{sent ? "✓ Sent to inbox" : "Send all to inbox"}</button></div><div style={styles.grid}><div style={styles.list}>{people.map((person) => <button key={person.name} disabled={deepStatus === "loading"} onClick={() => { setSelected(person); setDeeper(null); }} style={styles.person}><strong>{person.name}</strong><small>{person.role}</small><span>{person.score ?? "—"} ICP fit</span></button>)}</div>{selected && <article style={styles.detail}><p style={styles.eyebrow}>{selected.provider.toUpperCase()} OUTPUT · ICP SCORE</p><h3>{selected.name}</h3><p>{selected.summary}</p><p>{selected.fit}</p><p><strong>Recent signal:</strong> {selected.signal}</p><p><strong>Conversation hook:</strong> {selected.hook}</p><p><strong>Sources:</strong> {(selected.sources || []).join(" · ")}</p>{deeper && <div style={styles.deeper}><p style={styles.eyebrow}>BEZALEL DEEP RESEARCH</p><p>{deeper.summary}</p>{(deeper.findings || []).map((finding) => <div key={finding.title}><strong>{finding.title}</strong><p>{finding.detail}</p><small>{finding.source || finding.url}</small></div>)}</div>}<div style={styles.actions}><button onClick={() => setSent(true)} style={styles.primary}>{sent ? "✓ Added to research inbox" : "Add to inbox"}</button><button onClick={goDeeper} disabled={deepStatus === "loading" || status === "loading"} style={styles.secondary}>{deepStatus === "loading" ? "Researching…" : deeper ? "Research again" : "Research deeper with Bezalel"}</button></div></article>}</div></div>}
      </>
      )}
    </section>
  );
}

function TargetOptions({ field, label, values, issue, onChange }) {
  const options = exploriumTargetOptions[field];
  return (
    <div style={styles.targetField}>
      <label htmlFor={`target-${field}`}>{label}</label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
        {values.map(value => <span key={value} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 7px", borderRadius: 5, background: issue?.values.includes(value) ? "#fee2e2" : "#eff6ff" }}>
          {value}<button type="button" aria-label={`Remove ${label}: ${value}`} onClick={() => onChange(values.filter(item => item !== value))} style={{ border: 0, background: "transparent", cursor: "pointer", color: "inherit" }}>&times;</button>
        </span>)}
      </div>
      <select id={`target-${field}`} value="" aria-invalid={!!issue} aria-describedby={issue ? `target-${field}-error` : undefined}
        onChange={event => { if (event.target.value) onChange([...new Set([...values, event.target.value])]); }} style={styles.input}>
        <option value="">Add {label.toLowerCase()}...</option>
        {options.filter(value => !values.includes(value)).map(value => <option key={value} value={value}>{value}</option>)}
      </select>
      {issue && <p id={`target-${field}-error`} style={styles.error}>{issue.message}</p>}
    </div>
  );
}

const styles = {
  wrap: { padding: "32px 40px 72px", maxWidth: 1000, margin: "0 auto", color: "#1a1a1a", fontFamily: "'Poppins', ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
  hero: { display: "flex", justifyContent: "space-between", gap: 20, marginBottom: 28 },
  eyebrow: { color: "#999", fontSize: 10, letterSpacing: ".08em", fontWeight: 700, marginBottom: 8, textTransform: "uppercase" },
  title: { margin: 0, fontSize: 30, fontWeight: 800, letterSpacing: "-.04em", color: "#1a1a1a" },
  intro: { maxWidth: 630, color: "#777", lineHeight: 1.6, fontSize: 14, marginTop: 10 },
  pill: { height: "fit-content", border: "1px solid #e8e8e6", borderRadius: 99, padding: "8px 12px", color: "#666", background: "#f7f7f5", fontSize: 11 },
  form: { maxWidth: 820, padding: 20, border: "1px solid #e8e8e6", borderRadius: 10, background: "#fbfbfa" },
  formHeading: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 },
  heading: { color: "#999", fontSize: 10, letterSpacing: ".08em", fontWeight: 700, margin: "0 0 12px", textTransform: "uppercase" },
  canvasHint: { color: "#888", fontSize: 11, margin: "-4px 0 12px" },
  generate: { border: "1px solid #dbeafe", borderRadius: 6, background: "#eff6ff", color: "#2563eb", padding: "8px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer" },
  label: { display: "block", fontSize: 12, fontWeight: 650, margin: "12px 0 6px", color: "#444" },
  textarea: { width: "100%", boxSizing: "border-box", border: "1px solid #e0e0de", borderRadius: 7, padding: 10, font: "inherit", fontSize: 13, resize: "vertical", background: "#fff", color: "#1a1a1a" },
  input: { width: "100%", boxSizing: "border-box", border: "1px solid #e0e0de", borderRadius: 7, padding: 10, font: "inherit", fontSize: 13, background: "#fff", color: "#1a1a1a" },
  targetGrid: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10, padding: 12, border: "1px solid #e8e8e6", borderRadius: 8, background: "#fff" },
  targetField: { display: "grid", gap: 5, fontSize: 11, color: "#555", fontWeight: 650 },
  success: { color: "#16a34a", fontSize: 11, margin: "8px 0 0" },
  footer: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginTop: 14 },
  hint: { color: "#999", fontSize: 11 },
  primary: { border: 0, borderRadius: 7, background: "#1a1a1a", color: "#fff", padding: "10px 14px", fontWeight: 700, fontSize: 12, cursor: "pointer" },
  error: { color: "#b91c1c", fontSize: 12, marginTop: 10 },
  empty: { marginTop: 34, maxWidth: 530, paddingTop: 28, borderTop: "1px solid #e8e8e6", color: "#888", fontSize: 13, lineHeight: 1.6 },
  results: { marginTop: 38 },
  resultHead: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 15, marginBottom: 14 },
  grid: { display: "grid", gridTemplateColumns: "minmax(300px, .9fr) minmax(400px, 1.4fr)", gap: 16, alignItems: "start" },
  list: { border: "1px solid #e8e8e6", borderRadius: 9, overflow: "hidden", background: "#fff" },
  person: { width: "100%", display: "grid", gridTemplateColumns: "1fr auto", gap: 5, padding: 14, border: 0, borderBottom: "1px solid #f0f0ee", background: "#fff", textAlign: "left", font: "inherit", cursor: "pointer", color: "#1a1a1a" },
  detail: { border: "1px solid #e8e8e6", borderRadius: 9, padding: 23, background: "#fff", color: "#666", lineHeight: 1.6 },
  secondary: { border: "1px solid #e0e0de", borderRadius: 7, background: "#fff", color: "#444", padding: "9px 12px", fontWeight: 650, fontSize: 12, cursor: "pointer" },
  actions: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 18 },
  deeper: { marginTop: 17, padding: 13, borderRadius: 7, background: "#f7f7f5", color: "#666", fontSize: 12, lineHeight: 1.55 },
};

const tabStyles = {
  bar: { display: "flex", gap: 6, marginBottom: 24, borderBottom: "1px solid #e8e8e6" },
  tab: { border: "none", background: "transparent", padding: "8px 14px", fontSize: 13, fontWeight: 600, color: "#777", cursor: "pointer", fontFamily: "inherit", borderBottom: "2px solid transparent", marginBottom: -1 },
  active: { color: "#1a1a1a", borderBottomColor: "#1a1a1a" },
};
