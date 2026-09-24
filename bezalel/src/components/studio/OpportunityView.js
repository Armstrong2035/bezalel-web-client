"use client";

import { useOpportunityForm } from "@/app/hooks/useOpportunityForm";
import { apiFetch } from "@/firebase/apiFetch";

import { useState, useRef, useEffect } from "react";
import { readResearchStream } from "@/app/lib/services/readResearchStream.mjs";
import { exploriumTargetOptions, getExploriumTargetIssues, normalizeTarget, targetLabels } from "@/app/lib/services/exploriumAdapter.mjs";

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
      <div style={styles.hero}><div><p style={styles.eyebrow}>OPPORTUNITY SERVICE · PEOPLE INTELLIGENCE</p><h2 style={styles.title}>Show me you know me.</h2><p style={styles.intro}>Choose who finds and enriches your prospects. Review evidence and ICP fit as profiles arrive.</p></div><span style={styles.pill}>{status === "loading" ? "Researching" : "Credit-safe pilot"}</span></div>
      <form onSubmit={run} style={styles.form}>
        <div role="status" aria-live="polite" style={{ ...styles.hint, marginBottom: 12 }}>
          {!draft.ready ? "Restoring form..." : !draft.persistent ? "Open a document to save this form." : draft.status === "error" ? (draft.localBackup ? "Saved on this device. Could not sync to your account." : "Could not save your changes. Keep this page open and retry.") : draft.status === "saving" || draft.status === "pending" ? "Saving..." : draft.status === "saved" ? "All changes saved" : "Changes save automatically"}
          {draft.status === "error" && <button type="button" onClick={draft.retry} style={{ ...styles.secondary, marginLeft: 12 }}>Retry save</button>}
        </div>
        <fieldset disabled={!draft.ready} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
        <fieldset style={{ border: "1px solid #b9c8bc", borderRadius: 8, padding: 14, margin: "0 0 20px", minWidth: 0, background: "#fff", color: "#20201f" }} disabled={status === "loading" || deepStatus === "loading"}>
          <legend style={{ fontSize: 14, fontWeight: 700, color: "#20201f", padding: "0 6px" }}>Choose your research provider</legend>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {[
              ["explorium", "Explorium", "Find and enrich professional profiles"],
              ["bezalel", "Bezalel", "Find people and research public sources"],
              ["vibe", "Vibe Prospecting", "Requires a Vibe OAuth connection"],
            ].map(([value, label, detail]) => (
              <label key={value} style={{ flex: "1 1 170px", display: "flex", alignItems: "flex-start", gap: 8, padding: 12, borderRadius: 7, border: provider === value ? "2px solid #287c2f" : "2px solid #dfe3dc", background: provider === value ? "#eaf7eb" : "#fff", color: "#20201f", cursor: "pointer" }}>
                <input type="radio" name="research-provider" value={value} checked={provider === value} onChange={() => setProvider(value)} style={{ marginTop: 3, accentColor: "#287c2f" }} />
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
    </section>
  );
}

function TargetOptions({ field, label, values, issue, onChange }) {
  const options = exploriumTargetOptions[field];
  return (
    <div style={styles.targetField}>
      <label htmlFor={`target-${field}`}>{label}</label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
        {values.map(value => <span key={value} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 7px", borderRadius: 5, background: issue?.values.includes(value) ? "#fff0ed" : "#edf4eb" }}>
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
  wrap: { padding: "32px 42px 72px", maxWidth: 1180, color: "#20201f", fontFamily: "'Poppins', ui-sans-serif, sans-serif" },
  hero: { display: "flex", justifyContent: "space-between", gap: 20, marginBottom: 28 },
  eyebrow: { color: "#8a8a85", fontSize: 10, letterSpacing: ".1em", fontWeight: 700, marginBottom: 8 },
  title: { margin: 0, fontSize: 31, letterSpacing: "-.045em" },
  intro: { maxWidth: 630, color: "#686862", lineHeight: 1.6, fontSize: 14, marginTop: 10 },
  pill: { height: "fit-content", border: "1px solid #dfe5de", borderRadius: 99, padding: "8px 12px", color: "#4a6251", background: "#f7fbf7", fontSize: 11 },
  form: { maxWidth: 820, padding: 20, border: "1px solid #e2e5df", borderRadius: 10, background: "#fafcf9" },
  formHeading: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 },
  heading: { color: "#8a8a85", fontSize: 10, letterSpacing: ".1em", fontWeight: 700, margin: "0 0 12px" },
  canvasHint: { color: "#73736d", fontSize: 11, margin: "-4px 0 12px" },
  generate: { border: "1px solid #b8d9ba", borderRadius: 6, background: "#f4fbf4", color: "#287c2f", padding: "8px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer" },
  label: { display: "block", fontSize: 12, fontWeight: 650, margin: "12px 0 6px" },
  textarea: { width: "100%", boxSizing: "border-box", border: "1px solid #dfe3dc", borderRadius: 7, padding: 10, font: "inherit", fontSize: 13, resize: "vertical", background: "#fff" },
  input: { width: "100%", boxSizing: "border-box", border: "1px solid #dfe3dc", borderRadius: 7, padding: 10, font: "inherit", fontSize: 13, background: "#fff" },
  targetGrid: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10, padding: 12, border: "1px solid #dfe3dc", borderRadius: 8, background: "#fff" },
  targetField: { display: "grid", gap: 5, fontSize: 11, color: "#555", fontWeight: 650 },
  success: { color: "#287c2f", fontSize: 11, margin: "8px 0 0" },
  footer: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginTop: 14 },
  hint: { color: "#84847d", fontSize: 11 },
  primary: { border: 0, borderRadius: 6, background: "#272725", color: "#fff", padding: "10px 14px", fontWeight: 700, fontSize: 12, cursor: "pointer" },
  error: { color: "#a24646", fontSize: 12, marginTop: 10 },
  empty: { marginTop: 34, maxWidth: 530, paddingTop: 28, borderTop: "1px solid #e8e8e3", color: "#72726c", fontSize: 13, lineHeight: 1.6 },
  results: { marginTop: 38 },
  resultHead: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 15, marginBottom: 14 },
  grid: { display: "grid", gridTemplateColumns: "minmax(300px, .9fr) minmax(400px, 1.4fr)", gap: 16, alignItems: "start" },
  list: { border: "1px solid #e5e5df", borderRadius: 9, overflow: "hidden", background: "#fff" },
  person: { width: "100%", display: "grid", gridTemplateColumns: "1fr auto", gap: 5, padding: 14, border: 0, borderBottom: "1px solid #efefeb", background: "#fff", textAlign: "left", font: "inherit", cursor: "pointer" },
  detail: { border: "1px solid #e1e6e0", borderRadius: 9, padding: 23, background: "#fff", color: "#565650", lineHeight: 1.6 },
  secondary: { border: "1px solid #d5dbd3", borderRadius: 6, background: "#fff", color: "#3c5e48", padding: "9px 12px", fontWeight: 650, fontSize: 12, cursor: "pointer" },
  actions: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 18 },
  deeper: { marginTop: 17, padding: 13, borderRadius: 7, background: "#f5f8f4", color: "#4b5f50", fontSize: 12, lineHeight: 1.55 },
};
