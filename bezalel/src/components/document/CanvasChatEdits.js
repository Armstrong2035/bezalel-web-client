"use client";

import { useEffect, useRef, useState } from "react";
import { apiFetch } from "@/firebase/apiFetch";
import { useSegmentsStore } from "@/stores/segmentsStore";
import { CANVAS_EDIT_FIELDS, CANVAS_SECTION_LABELS } from "@/app/lib/services/canvasEdits.mjs";

export default function CanvasChatEdits({ docId, userId, messages, disabled }) {
  const [proposal, setProposal] = useState(null);
  const [selected, setSelected] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const controller = useRef(null);
  useEffect(() => () => controller.current?.abort(), []);

  async function propose() {
    if (busy || disabled) return;
    setBusy(true); setError(""); setStatus(""); setProposal(null);
    controller.current = new AbortController();
    try {
      const response = await apiFetch("/api/chat/canvas-edits", {
        method: "POST", headers: { "Content-Type": "application/json" }, signal: controller.current.signal,
        body: JSON.stringify({ userId, documentId: docId, messages }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not propose canvas edits.");
      if (!data.edits.length) setStatus(data.reason || "No clear canvas edits found. Tell chat which part you want to change, then try again.");
      else {
        setProposal(data);
        setSelected(Object.fromEntries(data.edits.flatMap((edit, index) => Object.keys(edit.changes).map(field => [`${index}:${field}`, true]))));
      }
    } catch (err) {
      if (err.name !== "AbortError") setError(err.message);
    } finally { setBusy(false); }
  }

  async function apply() {
    if (busy || disabled || !proposal) return;
    const edits = proposal.edits.map((edit, index) => {
      const changes = Object.fromEntries(Object.entries(edit.changes).filter(([field]) => selected[`${index}:${field}`]));
      return { ideaId: edit.ideaId, segment: edit.segment, changes, originalValues: Object.fromEntries(Object.keys(changes).map(field => [field, edit.current[field]])) };
    }).filter(edit => Object.keys(edit.changes).length);
    if (!edits.length) return;
    setBusy(true); setError("");
    controller.current = new AbortController();
    try {
      const response = await apiFetch("/api/chat/canvas-edits", {
        method: "PATCH", headers: { "Content-Type": "application/json" }, signal: controller.current.signal,
        body: JSON.stringify({ userId, documentId: docId, edits }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save canvas edits.");
      // Patch only edited fields, preserving current decisions and other live data.
      useSegmentsStore.setState(state => ({ segments: Object.fromEntries(Object.entries(state.segments).map(([id, idea]) => {
        const update = data.updates.find(item => item.id === id);
        return [id, update ? { ...idea, ...update.changes } : idea];
      })) }));
      setProposal(null);
      setStatus("Canvas updated. Your next chat response will use the saved changes.");
    } catch (err) {
      if (err.name !== "AbortError") setError(err.message);
    } finally { setBusy(false); }
  }

  return <section aria-label="Canvas edits from chat" style={{ marginBottom: 10, fontSize: 12 }}>
    <button onClick={propose} disabled={busy || disabled || !messages.some(m => m.role === "user")} style={buttonStyle}>
      {busy ? "Working..." : "Propose canvas edits from chat"}
    </button>
    {proposal && <div style={{ marginTop: 8, padding: 12, background: "#f4f7ed", border: "1px solid #d6ddc6", borderRadius: 8, maxHeight: "40vh", overflowY: "auto" }}>
      <strong>Review canvas edits</strong>
      <p>{proposal.reason} Nothing is saved until you apply it.</p>
      {proposal.edits.map((edit, index) => <fieldset key={edit.ideaId} style={{ border: "1px solid #d6ddc6", borderRadius: 5, padding: 10, margin: "0 0 12px", minWidth: 0 }}>
        <legend>{CANVAS_SECTION_LABELS[edit.segment]}: {edit.current.title}</legend>
        {Object.entries(edit.changes).map(([field, value]) => {
          const key = `${index}:${field}`;
          return <div key={field} style={{ marginBottom: 10 }}>
            <label style={{ display: "flex", gap: 6, alignItems: "center", fontWeight: 600 }}>
              <input type="checkbox" checked={!!selected[key]} disabled={busy} onChange={e => setSelected(current => ({ ...current, [key]: e.target.checked }))} />
              {CANVAS_EDIT_FIELDS[field]}
            </label>
            <p style={{ whiteSpace: "pre-wrap", color: "#666", margin: "4px 0" }}>Current: {edit.current[field] || "Not set"}</p>
            <textarea aria-label={`Proposed ${CANVAS_EDIT_FIELDS[field]} for ${edit.current.title}`} value={value} maxLength={field === "title" ? 240 : 8000} disabled={busy || !selected[key]} rows={field === "title" ? 2 : 4}
              onChange={e => setProposal(current => ({ ...current, edits: current.edits.map((item, i) => i === index ? { ...item, changes: { ...item.changes, [field]: e.target.value } } : item) }))}
              style={{ width: "100%", boxSizing: "border-box", padding: 8, border: "1px solid #cbd1bf", borderRadius: 5, font: "inherit", resize: "vertical" }} />
          </div>;
        })}
      </fieldset>)}
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={apply} disabled={busy || disabled || !Object.values(selected).some(Boolean)} style={buttonStyle}>Apply selected canvas edits</button>
        <button onClick={() => { setProposal(null); setError(""); }} disabled={busy} style={buttonStyle}>Cancel</button>
      </div>
    </div>}
    {error && <p role="alert" style={{ color: "#b91c1c" }}>{error}</p>}
    {status && <p role="status">{status}</p>}
  </section>;
}

const buttonStyle = { padding: "6px 10px", border: "1px solid #cbd1bf", borderRadius: 5, background: "white", color: "#315326", font: "inherit", cursor: "pointer" };
