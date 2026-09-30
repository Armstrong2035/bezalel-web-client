"use client";

import { useEffect, useRef, useState } from "react";
import { apiFetch } from "@/firebase/apiFetch";
import { useDocumentStore } from "@/stores/documentStore";
import { CONTEXT_FIELDS } from "@/app/lib/services/contextChanges.mjs";

export default function ContextChatAction({ docId, userId, messages, disabled }) {
  const [proposal, setProposal] = useState(null);
  const [selected, setSelected] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const controller = useRef(null);
  const setDocumentContext = useDocumentStore(state => state.setDocumentContext);
  useEffect(() => () => controller.current?.abort(), []);

  async function propose() {
    if (busy || disabled) return;
    setBusy(true); setError(""); setStatus(""); setProposal(null);
    controller.current = new AbortController();
    try {
      const response = await apiFetch("/api/chat/context-action", {
        method: "POST", headers: { "Content-Type": "application/json" },
        signal: controller.current.signal,
        body: JSON.stringify({ userId, documentId: docId, messages }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not propose changes.");
      if (!Object.keys(data.changes).length) {
        setStatus(data.reason || "No clear context changes found. Tell chat what you want to update, then try again.");
      } else {
        setProposal(data);
        setSelected(Object.fromEntries(Object.keys(data.changes).map(key => [key, true])));
      }
    } catch (err) {
      if (err.name !== "AbortError") setError(err.message);
    } finally { setBusy(false); }
  }

  async function apply() {
    if (busy || disabled || !proposal) return;
    const changes = Object.fromEntries(Object.entries(proposal.changes).filter(([key]) => selected[key]));
    if (!Object.keys(changes).length) return;
    setBusy(true); setError("");
    controller.current = new AbortController();
    try {
      const response = await apiFetch("/api/chat/context-action", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        signal: controller.current.signal,
        body: JSON.stringify({ userId, documentId: docId, changes, originalValues: Object.fromEntries(Object.keys(changes).map(key => [key, proposal.currentContext[key] ?? ""])) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save context.");
      setDocumentContext(docId, data.context);
      setProposal(null);
      setStatus("Context updated. Your next chat response will use these changes.");
    } catch (err) {
      if (err.name !== "AbortError") setError(err.message);
    } finally { setBusy(false); }
  }

  return <section aria-label="Context changes from chat" style={{ marginBottom: 10, fontSize: 12 }}>
    <button onClick={propose} disabled={busy || disabled || !messages.some(m => m.role === "user")} style={buttonStyle}>
      {busy ? "Working..." : "Propose context changes from chat"}
    </button>
    {proposal && <div style={{ marginTop: 8, padding: 12, background: "#f4f7ed", border: "1px solid #d6ddc6", borderRadius: 8, maxHeight: "40vh", overflowY: "auto" }}>
      <strong>Review context changes</strong>
      <p>{proposal.reason} Nothing is saved until you apply it.</p>
      {Object.entries(proposal.changes).map(([key, value]) => <div key={key} style={{ marginBottom: 12 }}>
        <label style={{ display: "flex", gap: 6, alignItems: "center", fontWeight: 600 }}>
          <input type="checkbox" checked={!!selected[key]} disabled={busy} onChange={e => setSelected(current => ({ ...current, [key]: e.target.checked }))} />
          {CONTEXT_FIELDS[key]}
        </label>
        <p style={{ whiteSpace: "pre-wrap", color: "#666", margin: "4px 0" }}>Current: {proposal.currentContext[key] || "Not set"}</p>
        <textarea aria-label={`Proposed ${CONTEXT_FIELDS[key]}`} value={value} maxLength={4000} disabled={busy || !selected[key]} rows={2}
          onChange={e => setProposal(current => ({ ...current, changes: { ...current.changes, [key]: e.target.value } }))}
          style={{ width: "100%", boxSizing: "border-box", padding: 8, border: "1px solid #cbd1bf", borderRadius: 5, font: "inherit", resize: "vertical" }} />
      </div>)}
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={apply} disabled={busy || disabled || !Object.values(selected).some(Boolean)} style={buttonStyle}>Apply selected changes</button>
        <button onClick={() => { setProposal(null); setError(""); }} disabled={busy} style={buttonStyle}>Cancel</button>
      </div>
    </div>}
    {error && <p role="alert" style={{ color: "#b91c1c" }}>{error}</p>}
    {status && <p role="status">{status}</p>}
  </section>;
}

const buttonStyle = { padding: "6px 10px", border: "1px solid #cbd1bf", borderRadius: 5, background: "white", color: "#315326", font: "inherit", cursor: "pointer" };
