"use client";

import { apiFetch } from "@/firebase/apiFetch";
import { useCallback, useEffect, useState } from "react";

const FONT =
  "'Poppins', ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

const STATUS_META = {
  success: { label: "Success", color: "#16a34a", tone: "#f0fdf4" },
  partial: { label: "Partial", color: "#b45309", tone: "#fffbeb" },
  failed: { label: "Failed", color: "#b91c1c", tone: "#fef2f2" },
};

function formatTime(ms) {
  if (!ms) return "—";
  return new Date(ms).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function DigestPanel() {
  const [settings, setSettings] = useState({ paused: false });
  const [automations, setAutomations] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [running, setRunning] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const load = useCallback(async () => {
    const controller = new AbortController();
    setError("");
    try {
      const res = await apiFetch("/api/digest", { signal: controller.signal });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Could not load the digest.");
      setSettings(body.settings ?? { paused: false });
      setAutomations(body.automations ?? []);
      setDocuments(body.documents ?? []);
      setRuns(body.runs ?? []);
    } catch (err) {
      if (err.name !== "AbortError") setError(err.message);
    } finally {
      setLoading(false);
    }
    return () => controller.abort();
  }, []);

  useEffect(() => {
    load();
  }, [load, attempt]);

  const togglePause = async () => {
    const next = !settings.paused;
    setSettings((s) => ({ ...s, paused: next }));
    try {
      await apiFetch("/api/digest", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paused: next }),
      });
    } catch {
      setSettings((s) => ({ ...s, paused: !next }));
    }
  };

  const runNow = async () => {
    if (running) return;
    setRunning(true);
    setError("");
    try {
      await apiFetch("/api/digest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      setAttempt((n) => n + 1);
    } catch (err) {
      setError(err.message || "Run failed.");
    } finally {
      setRunning(false);
    }
  };

  const toggleDocument = async (docId, enabled) => {
    const next = !enabled;
    setAutomations((list) =>
      list.map((a) => (a.documentId === docId ? { ...a, enabled: next } : a)),
    );
    if (!automations.some((a) => a.documentId === docId)) {
      setAutomations((list) => [...list, { documentId: docId, enabled: next }]);
    }
    try {
      await apiFetch(`/api/documents/${encodeURIComponent(docId)}/automation`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: next }),
      });
    } catch {
      setAttempt((n) => n + 1);
    }
  };

  const automationByDoc = new Map(automations.map((a) => [a.documentId, a.enabled]));
  const docRows = documents.map((doc) => ({
    ...doc,
    enabled: automationByDoc.get(doc.id) ?? false,
  }));

  if (loading) {
    return (
      <div style={{ padding: "48px 40px", color: "#aaa", fontFamily: FONT }}>
        Loading digest…
      </div>
    );
  }

  return (
    <section style={{ flex: 1, minWidth: 0, overflowY: "auto", fontFamily: FONT, color: "#1a1a1a" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 40px 72px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 8 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, letterSpacing: "-0.4px" }}>Daily digest</h1>
          <p style={{ margin: "6px 0 0", fontSize: 13.5, color: "#777", lineHeight: 1.5 }}>
            Every day, Bezalel checks your sources for anything worth reacting to and drops it in your inbox.
          </p>
        </div>
        <button
          onClick={togglePause}
          title={settings.paused ? "Resume the digest" : "Pause the digest"}
          style={{
            border: "1px solid #e0e0de",
            background: settings.paused ? "#fee2e2" : "#ffffff",
            color: settings.paused ? "#b91c1c" : "#444",
            borderRadius: 7,
            padding: "7px 12px",
            fontSize: 12.5,
            fontWeight: 600,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          {settings.paused ? "Paused · Resume" : "Pause"}
        </button>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 16, margin: "16px 0 28px", flexWrap: "wrap" }}>
        <span style={{ fontSize: 12.5, color: "#666", background: "#f7f7f5", border: "1px solid #e8e8e6", borderRadius: 99, padding: "5px 12px" }}>
          ⏱ Daily · 12:00 UTC
        </span>
        <button
          onClick={runNow}
          disabled={running}
          style={{
            border: "none",
            background: "#1a1a1a",
            color: "#fff",
            borderRadius: 7,
            padding: "8px 14px",
            fontSize: 13,
            fontWeight: 600,
            cursor: running ? "wait" : "pointer",
            opacity: running ? 0.6 : 1,
          }}
        >
          {running ? "Running…" : "Run now"}
        </button>
        {error && <span role="alert" style={{ fontSize: 12.5, color: "#b91c1c" }}>{error}</span>}
      </div>

      {/* Automations */}
      <h2 style={{ fontSize: 11, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 10px" }}>
        Automated documents
      </h2>
      {docRows.length === 0 ? (
        <p style={{ fontSize: 13, color: "#888", margin: "0 0 28px" }}>
          No documents yet. Create one, set its outreach target, then turn automation on here.
        </p>
      ) : (
        <div style={{ display: "grid", gap: 6, marginBottom: 28 }}>
          {docRows.map((doc) => (
            <div key={doc.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", border: "1px solid #e8e8e6", borderRadius: 9, background: "#fff" }}>
              <span style={{ fontSize: 14 }}>📄</span>
              <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 13.5, fontWeight: 600 }}>
                {doc.title || "Untitled"}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={doc.enabled}
                onClick={() => toggleDocument(doc.id, doc.enabled)}
                style={{
                  width: 38,
                  height: 22,
                  borderRadius: 99,
                  border: "none",
                  background: doc.enabled ? "#1a1a1a" : "#d4d4d2",
                  cursor: "pointer",
                  position: "relative",
                  padding: 0,
                  flexShrink: 0,
                  transition: "background 0.15s",
                }}
              >
                <span style={{ position: "absolute", top: 3, left: doc.enabled ? 19 : 3, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left 0.15s" }} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Run history */}
      <h2 style={{ fontSize: 11, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 10px" }}>
        Run history
      </h2>
      {runs.length === 0 ? (
        <p style={{ fontSize: 13, color: "#888", margin: 0 }}>
          No runs yet. Click “Run now” or wait for the daily schedule.
        </p>
      ) : (
        <div style={{ display: "grid", gap: 6 }}>
          {runs.map((run) => {
            const meta = STATUS_META[run.status] ?? STATUS_META.failed;
            return (
              <div key={run.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", border: "1px solid #e8e8e6", borderRadius: 9, background: "#fff" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: meta.color, background: meta.tone, borderRadius: 99, padding: "2px 9px", flexShrink: 0 }}>
                  {meta.label}
                </span>
                <span style={{ flex: 1, fontSize: 12.5, color: "#666" }}>
                  {formatTime(run.finishedAt ?? run.startedAt)}
                </span>
                <span style={{ fontSize: 12.5, color: "#444", fontWeight: 600 }}>
                  {run.added != null ? `+${run.added} new` : ""}
                </span>
              </div>
            );
          })}
        </div>
      )}
      </div>
    </section>
  );
}
