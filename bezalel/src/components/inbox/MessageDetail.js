"use client";

import { MESSAGE_TYPE_META, formatRelativeTime } from "@/stores/inboxMetadata";

/**
 * Reading pane of the email shell. Presents one message with email-style
 * headers (from/to), the body, supporting evidence, a suggested angle, and
 * actions that route the user back to the attached document.
 */
export default function MessageDetail({
  message,
  onOpen,
  onMarkRead,
  onMarkUnread,
  onDismiss,
  onOpenPlanning,
}) {
  if (!message) {
    return (
      <section style={styles.pane}>
        <div style={styles.empty}>
          <p style={{ fontSize: 32, margin: "0 0 10px" }}>✉️</p>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#555" }}>
            Select a message
          </p>
          <p style={{ margin: "8px 0 0", fontSize: 13, color: "#aaa", maxWidth: 340 }}>
            Prospects, topics to address, and automation results will appear here.
          </p>
          <button type="button" onClick={onOpenPlanning} style={{ marginTop: 20, padding: "12px 18px", border: "1px solid #d6dfc5", borderRadius: 7, background: "#edf3dc", color: "#272e22", font: "inherit", fontSize: 13, cursor: "pointer" }}>Open business planning</button>
        </div>
      </section>
    );
  }

  const meta = MESSAGE_TYPE_META[message.type] ?? MESSAGE_TYPE_META.activity;
  const toLine = message.documentTitle ?? "Bezalel";

  return (
    <section style={styles.pane}>
      <article style={styles.article}>
        {/* Toolbar */}
        <div style={styles.toolbar}>
          <div style={styles.toolbarActions}>
            <button
              onClick={onDismiss}
              title="Dismiss"
              style={styles.iconBtn}
            >
              🗑
            </button>
            {message.status === "unread" ? (
              <button onClick={onMarkRead} style={styles.textBtn}>Mark read</button>
            ) : (
              <button onClick={onMarkUnread} style={styles.textBtn}>Mark unread</button>
            )}
          </div>
          {message.documentId && (
            <button onClick={onOpen} style={styles.primaryBtn}>
              Open →
            </button>
          )}
        </div>

        {/* Subject */}
        <h1 style={styles.subject}>{message.subject}</h1>

        {/* Email-style headers */}
        <div style={styles.headers}>
          <div style={styles.headerRow}>
            <span style={styles.headerKey}>From</span>
            <span style={{ ...styles.typePill, color: meta.color, background: meta.tone }}>
              {meta.icon} {message.source}
            </span>
          </div>
          <div style={styles.headerRow}>
            <span style={styles.headerKey}>To</span>
            <span style={styles.headerValue}>
              {message.documentId ? `📄 ${toLine}` : "Bezalel"}
            </span>
          </div>
          <div style={styles.headerRow}>
            <span style={styles.headerKey}>Date</span>
            <span style={styles.headerValue}>
              {formatRelativeTime(message.createdAt)}
              {message.requiresAction && <span style={styles.actionBadge}>needs action</span>}
            </span>
          </div>
        </div>

        {/* Body */}
        <div style={styles.body}>
          <p style={styles.paragraph}>{message.body}</p>

          {message.evidence?.length > 0 && (
            <div style={styles.section}>
              <h3 style={styles.sectionHeading}>Evidence</h3>
              {message.evidence.map((item, index) => (
                <div key={`${item.source}-${index}`} style={styles.evidence}>
                  <strong>{item.source}{item.title ? ` · ${item.title}` : ""}</strong>
                  <p style={styles.evidenceText}>{item.excerpt}</p>
                </div>
              ))}
            </div>
          )}

          {message.suggestedAngle && (
            <div style={styles.angle}>
              <h3 style={styles.sectionHeading}>Topic to address</h3>
              <p style={styles.angleText}>“{message.suggestedAngle}”</p>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div style={styles.footer}>
          {message.documentId && (
            <button onClick={onOpen} style={styles.primaryBtn}>
              Open {toLine} →
            </button>
          )}
        </div>
      </article>
    </section>
  );
}

const styles = {
  pane: {
    flex: 1,
    minWidth: 0,
    height: "100vh",
    overflowY: "auto",
    backgroundColor: "#ffffff",
  },
  article: { maxWidth: 760, padding: "32px 40px 64px", margin: "0 auto" },
  empty: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "#aaa",
    textAlign: "center",
    padding: 40,
  },
  toolbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 24,
  },
  toolbarActions: { display: "flex", alignItems: "center", gap: 8 },
  iconBtn: {
    border: "1px solid #e0e0de",
    background: "transparent",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 14,
    padding: "6px 9px",
    color: "#666",
  },
  textBtn: {
    border: "none",
    background: "none",
    cursor: "pointer",
    color: "#2563eb",
    fontSize: 12,
    fontWeight: 600,
    fontFamily: "inherit",
  },
  primaryBtn: {
    padding: "8px 14px",
    fontSize: 13,
    fontWeight: 600,
    color: "white",
    background: "#1a1a1a",
    border: "none",
    borderRadius: 7,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  subject: {
    margin: "0 0 20px",
    fontSize: 24,
    fontWeight: 800,
    color: "#1a1a1a",
    letterSpacing: "-0.4px",
    lineHeight: 1.25,
  },
  headers: {
    border: "1px solid #ecece9",
    borderRadius: 10,
    padding: "14px 16px",
    display: "grid",
    gap: 10,
    background: "#fbfbfa",
    marginBottom: 24,
  },
  headerRow: { display: "flex", alignItems: "center", gap: 12, fontSize: 13 },
  headerKey: { width: 48, color: "#999", fontSize: 12, fontWeight: 600, flexShrink: 0 },
  headerValue: { color: "#444", display: "flex", alignItems: "center", gap: 8 },
  typePill: { fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99 },
  actionBadge: {
    fontSize: 10,
    fontWeight: 700,
    color: "#b45309",
    background: "#fef3c7",
    padding: "1px 6px",
    borderRadius: 99,
  },
  body: { display: "grid", gap: 24 },
  paragraph: { margin: 0, fontSize: 14.5, color: "#333", lineHeight: 1.7 },
  section: { display: "grid", gap: 10 },
  sectionHeading: {
    margin: 0,
    fontSize: 11,
    fontWeight: 700,
    color: "#999",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  evidence: {
    padding: "12px 14px",
    border: "1px solid #ecece9",
    borderRadius: 8,
    background: "#fbfbfa",
    display: "grid",
    gap: 4,
  },
  evidenceText: { margin: 0, fontSize: 13, color: "#666", lineHeight: 1.55 },
  angle: {
    padding: "16px 18px",
    borderRadius: 10,
    background: "#f5f3ff",
    border: "1px solid #ede9fe",
  },
  angleText: { margin: "8px 0 0", fontSize: 15, color: "#4c1d95", lineHeight: 1.6, fontStyle: "italic" },
  footer: { marginTop: 28, display: "flex", gap: 10 },
};
