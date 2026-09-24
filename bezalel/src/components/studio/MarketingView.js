"use client";

import { apiFetch } from "@/firebase/apiFetch";

import { useEffect, useState } from "react";

const fontFamily =
  "'Poppins', ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

function formatCtr(ctr) {
  if (ctr === undefined || ctr === null) return "—";
  return (ctr * 100).toFixed(1) + "%";
}

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function MarketingView({ document }) {
  const [rules, setRules] = useState([]);
  const [rulesLoading, setRulesLoading] = useState(true);
  const [rulesError, setRulesError] = useState(null);

  const [selectedRuleId, setSelectedRuleId] = useState(null);
  const [opportunities, setOpportunities] = useState(null);
  const [oppLoading, setOppLoading] = useState(false);
  const [oppError, setOppError] = useState(null);

  const [target, setTarget] = useState("");
  const [propertyId, setPropertyId] = useState("");
  const [dataset, setDataset] = useState("query-page-web-v1");
  const [preview, setPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState(null);

  const loadRules = async () => {
    setRulesLoading(true);
    setRulesError(null);
    try {
      const res = await apiFetch("/api/marketing?resource=rules", { cache: "no-store" });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error ?? "Could not load rules.");
      setRules(Array.isArray(payload.data) ? payload.data : payload.data?.data ?? []);
    } catch (err) {
      setRulesError(err.message);
    } finally {
      setRulesLoading(false);
    }
  };

  useEffect(() => {
    loadRules();
  }, []);

  const loadOpportunities = async (ruleId) => {
    setSelectedRuleId(ruleId);
    setOppLoading(true);
    setOppError(null);
    setOpportunities(null);
    try {
      const res = await apiFetch(
        `/api/marketing?resource=opportunities&rule_id=${encodeURIComponent(ruleId)}`,
        { cache: "no-store" },
      );
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error ?? "Could not load opportunities.");
      setOpportunities(payload);
    } catch (err) {
      setOppError(err.message);
    } finally {
      setOppLoading(false);
    }
  };

  const handlePreview = async () => {
    if (!target.trim() || !propertyId.trim()) return;
    setPreviewLoading(true);
    setPreviewError(null);
    setPreview(null);
    try {
      const res = await apiFetch("/api/marketing/rules/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: target.trim(), property_id: propertyId.trim(), dataset }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error ?? "Could not preview the rule.");
      setPreview(payload);
    } catch (err) {
      setPreviewError(err.message);
    } finally {
      setPreviewLoading(false);
    }
  };

  const selectedRule = rules.find((r) => r.rule_id === selectedRuleId);
  const oppRows = Array.isArray(opportunities?.data) ? opportunities.data : [];

  return (
    <section style={s.wrapper}>
      <p style={s.eyebrow}>MARKETING</p>
      <h2 style={s.title}>Opportunity rules</h2>
      <p style={s.intro}>
        {document?.title ? `Rules and opportunities for ${document.title}. ` : ""}
        Saved rules come from your Poysis workspace and turn search data into action items.
      </p>

      {/* Create / preview */}
      <div style={s.card}>
        <p style={s.sectionHeading}>CREATE A RULE</p>
        <label style={s.label}>Target (plain language)</label>
        <textarea
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder="e.g. Find queries containing invoice, with at least 500 impressions, CTR below 3%, over 28 days."
          rows={2}
          style={s.textarea}
        />
        <div style={s.formRow}>
          <div style={s.formField}>
            <label style={s.label}>Property</label>
            <input
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
              placeholder="sc-domain:example.com"
              style={s.input}
            />
          </div>
          <div style={s.formField}>
            <label style={s.label}>Dataset</label>
            <input
              value={dataset}
              onChange={(e) => setDataset(e.target.value)}
              placeholder="query-page-web-v1"
              style={s.input}
            />
          </div>
        </div>
        <button
          onClick={handlePreview}
          disabled={previewLoading || !target.trim() || !propertyId.trim()}
          style={{
            ...s.primaryBtn,
            opacity: previewLoading || !target.trim() || !propertyId.trim() ? 0.5 : 1,
            cursor: previewLoading || !target.trim() || !propertyId.trim() ? "not-allowed" : "pointer",
          }}
        >
          {previewLoading ? "Previewing…" : "Preview rule"}
        </button>

        {previewError && <p style={s.error}>{previewError}</p>}

        {preview && (
          <div style={s.previewCard}>
            <p style={s.previewStatus}>
              {preview.status === "ready" ? "Ready" : "Needs clarification"}
            </p>
            {preview.summary && <p style={s.previewSummary}>{preview.summary}</p>}
            {preview.status === "needs_clarification" && preview.questions?.length > 0 && (
              <ul style={s.list}>
                {preview.questions.map((q, i) => (
                  <li key={i} style={s.listItem}>{q}</li>
                ))}
              </ul>
            )}
            {preview.assumptions?.length > 0 && (
              <>
                <p style={s.previewLabel}>Assumptions</p>
                <ul style={s.list}>
                  {preview.assumptions.map((a, i) => (
                    <li key={i} style={s.listItem}>{a}</li>
                  ))}
                </ul>
              </>
            )}
            {preview.rule && (
              <>
                <p style={s.previewLabel}>Draft rule</p>
                <pre style={s.code}>{JSON.stringify(preview.rule, null, 2)}</pre>
              </>
            )}
          </div>
        )}
      </div>

      {/* Saved rules */}
      <div style={s.section}>
        <p style={s.sectionHeading}>SAVED RULES</p>
        {rulesLoading && <p style={s.muted}>Loading rules…</p>}
        {rulesError && <p style={s.error}>{rulesError}</p>}
        {!rulesLoading && !rulesError && rules.length === 0 && (
          <p style={s.muted}>No saved rules yet.</p>
        )}
        {rules.length > 0 && (
          <div style={s.grid}>
            {rules.map((rule) => {
              const cfg = rule.config ?? {};
              const isSelected = rule.rule_id === selectedRuleId;
              return (
                <button
                  key={rule.rule_id}
                  onClick={() => loadOpportunities(rule.rule_id)}
                  style={{ ...s.ruleCard, borderColor: isSelected ? "#20201f" : "#e7e7e2" }}
                >
                  <div style={s.ruleCardTop}>
                    <span style={s.ruleName}>{cfg.name ?? "Untitled rule"}</span>
                    <span
                      style={{
                        ...s.badge,
                        background: cfg.enabled === false ? "#f5f5f4" : "#eef7f0",
                        color: cfg.enabled === false ? "#999" : "#2f7d52",
                      }}
                    >
                      {cfg.enabled === false ? "Disabled" : "Enabled"}
                    </span>
                  </div>
                  <p style={s.ruleMeta}>{cfg.property_id ?? "—"} · {cfg.dataset ?? "—"}</p>
                  <p style={s.ruleMeta}>Revision {rule.revision} · {formatDate(rule.updated_at)}</p>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Opportunities */}
      {selectedRule && (
        <div style={s.section}>
          <p style={s.sectionHeading}>OPPORTUNITIES</p>
          <h3 style={s.oppTitle}>{selectedRule.config?.name ?? "Opportunities"}</h3>
          {opportunities?.summary && <p style={s.oppSummary}>{opportunities.summary}</p>}
          {opportunities?.coverage === "unverified" && (
            <p style={s.muted}>Coverage is unverified. Results may be incomplete.</p>
          )}

          {oppLoading && <p style={s.muted}>Loading opportunities…</p>}
          {oppError && <p style={s.error}>{oppError}</p>}

          {!oppLoading && !oppError && opportunities && oppRows.length === 0 && (
            <p style={s.muted}>No opportunities matched this rule.</p>
          )}

          {oppRows.length > 0 && (
            <div style={s.table}>
              <div style={s.tableHead}>
                <span style={{ flex: 2 }}>Query</span>
                <span style={{ flex: 1.4 }}>Page</span>
                <span>Impressions</span>
                <span>Clicks</span>
                <span>CTR</span>
                <span>Position</span>
              </div>
              {oppRows.map((row, i) => {
                const ev = row.evidence ?? {};
                return (
                  <div key={i} style={s.tableRow}>
                    <span style={{ flex: 2, fontWeight: 600, color: "#20201f" }}>
                      {row.dimensions?.query ?? "—"}
                    </span>
                    <span style={{ flex: 1.4, color: "#666" }}>{row.dimensions?.page ?? "—"}</span>
                    <span>{ev.impressions ?? "—"}</span>
                    <span>{ev.clicks ?? "—"}</span>
                    <span>{formatCtr(ev.ctr)}</span>
                    <span>{ev.average_position ?? "—"}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

const s = {
  wrapper: { padding: "28px 42px 72px", fontFamily, color: "#20201f" },
  eyebrow: { color: "#8a8a85", fontSize: 10, letterSpacing: "0.1em", fontWeight: 700, marginBottom: 8 },
  title: { margin: "0 0 8px", fontSize: 22, letterSpacing: "-0.02em" },
  intro: { maxWidth: 600, color: "#666", lineHeight: 1.65, margin: "0 0 24px", fontSize: 14 },
  section: { marginTop: 32 },
  sectionHeading: { color: "#8a8a85", fontSize: 10, letterSpacing: "0.1em", fontWeight: 700, margin: "0 0 12px" },
  card: {
    border: "1px solid #e7e7e2",
    borderRadius: 10,
    padding: 18,
    backgroundColor: "#fafaf8",
  },
  label: { display: "block", fontSize: 12, fontWeight: 600, marginBottom: 5, color: "#333" },
  textarea: {
    width: "100%",
    padding: "9px 11px",
    fontSize: 13,
    lineHeight: 1.5,
    border: "1px solid #e1e1dc",
    borderRadius: 7,
    resize: "vertical",
    outline: "none",
    fontFamily,
    color: "#20201f",
    boxSizing: "border-box",
    marginBottom: 12,
    background: "#fff",
  },
  formRow: { display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 },
  formField: { flex: 1, minWidth: 180 },
  input: {
    width: "100%",
    padding: "8px 11px",
    fontSize: 13,
    border: "1px solid #e1e1dc",
    borderRadius: 7,
    outline: "none",
    fontFamily,
    color: "#20201f",
    boxSizing: "border-box",
    background: "#fff",
  },
  primaryBtn: {
    padding: "8px 16px",
    fontSize: 13,
    fontWeight: 600,
    color: "#fff",
    background: "#1a1a1a",
    border: "none",
    borderRadius: 7,
    transition: "background 0.15s",
    cursor: "pointer",
  },
  error: { color: "#c0392b", fontSize: 12, marginTop: 10 },
  muted: { color: "#999", fontSize: 13 },
  previewCard: {
    marginTop: 14,
    padding: 14,
    border: "1px solid #e7e7e2",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  previewStatus: {
    fontSize: 10,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: "#2f7d52",
    margin: "0 0 6px",
  },
  previewSummary: { fontSize: 13, color: "#333", lineHeight: 1.55, margin: "0 0 10px" },
  previewLabel: { fontSize: 11, fontWeight: 700, color: "#666", margin: "10px 0 4px" },
  list: { margin: "0 0 8px", paddingLeft: 18, fontSize: 12, color: "#555", lineHeight: 1.6 },
  listItem: { marginBottom: 2 },
  code: {
    fontSize: 11,
    color: "#444",
    background: "#f7f7f5",
    border: "1px solid #eee",
    borderRadius: 6,
    padding: 10,
    overflowX: "auto",
    margin: 0,
    lineHeight: 1.5,
  },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 },
  ruleCard: {
    textAlign: "left",
    background: "#fff",
    border: "1px solid #e7e7e2",
    borderRadius: 9,
    padding: 14,
    cursor: "pointer",
    transition: "border-color 0.15s, box-shadow 0.15s",
    fontFamily,
  },
  ruleCardTop: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 6 },
  ruleName: { fontSize: 13, fontWeight: 600, color: "#20201f" },
  badge: { fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 999, whiteSpace: "nowrap" },
  ruleMeta: { margin: "2px 0", fontSize: 11, color: "#999" },
  oppTitle: { margin: "0 0 6px", fontSize: 16, fontWeight: 700 },
  oppSummary: { fontSize: 12, color: "#666", lineHeight: 1.5, margin: "0 0 6px" },
  table: { border: "1px solid #e7e7e2", borderRadius: 9, overflow: "hidden" },
  tableHead: {
    display: "flex",
    gap: 12,
    padding: "9px 14px",
    backgroundColor: "#fafaf8",
    borderBottom: "1px solid #e7e7e2",
    fontSize: 10,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    color: "#999",
  },
  tableRow: {
    display: "flex",
    gap: 12,
    padding: "10px 14px",
    borderBottom: "1px solid #f0f0ee",
    fontSize: 12,
    color: "#333",
  },
};
