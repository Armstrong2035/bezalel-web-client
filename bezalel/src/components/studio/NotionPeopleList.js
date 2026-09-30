"use client";

import { apiFetch } from "@/firebase/apiFetch";
import { useEffect, useState } from "react";

/**
 * Synced list of people from the Notion database. Replaces the iframe embed,
 * which Notion blocks. Fetches via the authenticated /api/notion/people route.
 */
export default function NotionPeopleList() {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [configured, setConfigured] = useState(true);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await apiFetch("/api/notion/people", { signal: controller.signal });
        const body = await res.json();
        if (!active) return;
        if (!res.ok) throw new Error(body.error || "Could not read Notion.");
        setConfigured(body.configured !== false);
        setPeople(body.people ?? []);
      } catch (err) {
        if (active && err.name !== "AbortError") setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
      controller.abort();
    };
  }, [attempt]);

  if (loading) {
    return <div style={styles.center}>Loading people from Notion…</div>;
  }

  if (!configured) {
    return (
      <div style={styles.center}>
        <h3>Notion is not connected yet.</h3>
        <p>Set NOTION_API_KEY and NOTION_DATABASE_ID on the server, then reload.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.center}>
        <h3>Could not read Notion.</h3>
        <p style={{ color: "#a24646" }}>{error}</p>
        <button onClick={() => setAttempt((n) => n + 1)} style={styles.retry}>Retry</button>
      </div>
    );
  }

  return (
    <section>
      <div style={styles.head}>
        <p style={styles.eyebrow}>NOTION · PEOPLE</p>
        <button onClick={() => setAttempt((n) => n + 1)} style={styles.refresh}>↻ Refresh</button>
      </div>

      {people.length === 0 ? (
        <p style={styles.emptyText}>
          No people saved yet. Run an outreach search and each person will appear here.
        </p>
      ) : (
        <div style={styles.list}>
          {people.map((person) => (
            <article key={person.id} style={styles.row}>
              <div style={styles.rowMain}>
                <strong style={styles.name}>{person.name || "Unknown"}</strong>
                {person.role && <span style={styles.role}>{person.role}</span>}
                {person.summary && <p style={styles.summary}>{person.summary}</p>}
              </div>
              <div style={styles.meta}>
                {person.score != null && <span style={styles.score}>{person.score} ICP</span>}
                {person.status && <span style={styles.pill}>{person.status}</span>}
                {person.provider && <span style={styles.provider}>{person.provider}</span>}
              </div>
              {person.url && (
                <a href={person.url} target="_blank" rel="noopener noreferrer" style={styles.open}>
                  Open in Notion →
                </a>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

const styles = {
  center: {
    padding: "48px 24px",
    color: "#888",
    fontSize: 13,
    lineHeight: 1.6,
  },
  retry: {
    border: "1px solid #e0e0de",
    borderRadius: 7,
    background: "#fff",
    color: "#444",
    padding: "8px 14px",
    fontWeight: 650,
    fontSize: 12,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  head: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 16,
  },
  eyebrow: { color: "#999", fontSize: 10, letterSpacing: ".08em", fontWeight: 700, margin: 0, textTransform: "uppercase" },
  refresh: {
    border: "1px solid #e0e0de",
    borderRadius: 7,
    background: "#fff",
    color: "#444",
    padding: "7px 12px",
    fontWeight: 650,
    fontSize: 12,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  emptyText: { color: "#888", fontSize: 13, lineHeight: 1.6, maxWidth: 520 },
  list: { display: "grid", gap: 10 },
  row: {
    border: "1px solid #e8e8e6",
    borderRadius: 9,
    padding: 16,
    background: "#fff",
    display: "grid",
    gap: 10,
  },
  rowMain: { display: "grid", gap: 4 },
  name: { fontSize: 15, color: "#1a1a1a" },
  role: { fontSize: 12.5, color: "#555" },
  summary: { margin: "4px 0 0", fontSize: 13, color: "#666", lineHeight: 1.5 },
  meta: { display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" },
  score: { fontSize: 11, fontWeight: 700, color: "#2563eb", background: "#eff6ff", padding: "2px 8px", borderRadius: 99 },
  pill: { fontSize: 11, fontWeight: 700, color: "#555", background: "#f0f0ee", padding: "2px 8px", borderRadius: 99 },
  provider: { fontSize: 11, color: "#777" },
  open: { fontSize: 12, fontWeight: 650, color: "#2563eb", textDecoration: "none", justifySelf: "start" },
};
