"use client";

import { MESSAGE_TYPE_META, formatRelativeTime } from "@/stores/inboxMetadata";

/**
 * Middle pane of the email shell: a searchable, filterable list of messages.
 * Each row shows an unread dot, the sending tool, a subject, a preview, and the
 * attached document plus relative time.
 */
export default function MessageList({
  messages,
  selectedId,
  onSelect,
  search,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  onMarkAllRead,
  unreadCount,
}) {
  const filterChips = [{ key: "All", label: "All" }]
    .concat(Object.entries(MESSAGE_TYPE_META).map(([key, meta]) => ({ key, label: meta.label })));

  return (
    <section style={styles.pane}>
      {/* Toolbar */}
      <div style={styles.toolbar}>
        <div style={styles.toolbarTop}>
          <h1 style={styles.title}>Inbox</h1>
          {unreadCount > 0 && (
            <button onClick={onMarkAllRead} style={styles.markAll}>
              Mark all read
            </button>
          )}
        </div>
        <input
          aria-label="Search messages"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search messages"
          style={styles.search}
        />
        <div style={styles.chips}>
          {filterChips.map((chip) => (
            <button
              key={chip.key}
              onClick={() => onTypeFilterChange(chip.key)}
              style={{ ...styles.chip, ...(typeFilter === chip.key ? styles.chipActive : {}) }}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div style={styles.list} role="list">
        {messages.length === 0 ? (
          <div style={styles.empty}>
            <p style={{ fontSize: 28, margin: "0 0 8px" }}>📭</p>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#555" }}>Nothing here</p>
            <p style={{ margin: "6px 0 0", fontSize: 13, color: "#aaa" }}>
              Tools will send you prospects and topics to address here.
            </p>
          </div>
        ) : (
          messages.map((message) => {
            const meta = MESSAGE_TYPE_META[message.type] ?? MESSAGE_TYPE_META.activity;
            const unread = message.status === "unread";
            return (
              <button
                key={message.id}
                role="listitem"
                data-message-id={message.id}
                onClick={() => onSelect(message.id)}
                style={{
                  ...styles.row,
                  ...(selectedId === message.id ? styles.rowActive : {}),
                  ...(unread ? styles.rowUnread : {}),
                }}
              >
                <div style={styles.rowTop}>
                  <span style={{ ...styles.typeDot, background: meta.color }} />
                  <span style={styles.from}>{message.source}</span>
                  <span style={{ ...styles.typePill, color: meta.color, background: meta.tone }}>
                    {meta.singular}
                  </span>
                  <span style={styles.time}>{formatRelativeTime(message.createdAt)}</span>
                </div>
                <div style={styles.subject}>{message.subject}</div>
                <div style={styles.preview}>{message.preview}</div>
                <div style={styles.rowFoot}>
                  {message.documentTitle && (
                    <span style={styles.docLink} title="Attached document">
                      📄 {message.documentTitle}
                    </span>
                  )}
                  {message.requiresAction && <span style={styles.actionBadge}>needs action</span>}
                </div>
              </button>
            );
          })
        )}
      </div>
    </section>
  );
}

const styles = {
  pane: {
    width: 340,
    minWidth: 300,
    maxWidth: 400,
    borderRight: "1px solid #e8e8e6",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#ffffff",
    height: "100vh",
    flexShrink: 0,
  },
  toolbar: {
    padding: "16px 16px 12px",
    borderBottom: "1px solid #e8e8e6",
    display: "grid",
    gap: 10,
  },
  toolbarTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  title: {
    margin: 0,
    fontSize: 20,
    fontWeight: 800,
    color: "#1a1a1a",
    letterSpacing: "-0.4px",
  },
  markAll: {
    border: "none",
    background: "none",
    cursor: "pointer",
    color: "#2563eb",
    fontSize: 12,
    fontWeight: 600,
    fontFamily: "inherit",
  },
  search: {
    width: "100%",
    boxSizing: "border-box",
    padding: "8px 10px",
    fontSize: 13,
    border: "1px solid #e1e1dc",
    borderRadius: 6,
    outline: "none",
    fontFamily: "inherit",
    color: "#1a1a1a",
  },
  chips: { display: "flex", flexWrap: "wrap", gap: 6 },
  chip: {
    border: "1px solid #e1e1dc",
    background: "transparent",
    padding: "4px 9px",
    borderRadius: 99,
    color: "#666",
    cursor: "pointer",
    fontSize: 11,
    fontFamily: "inherit",
  },
  chipActive: {
    background: "#1a1a1a",
    color: "white",
    borderColor: "#1a1a1a",
  },
  list: { flex: 1, overflowY: "auto" },
  empty: { textAlign: "center", padding: "60px 20px" },
  row: {
    width: "100%",
    display: "grid",
    gap: 4,
    padding: "14px 16px",
    border: "none",
    borderBottom: "1px solid #f0f0ee",
    background: "transparent",
    textAlign: "left",
    cursor: "pointer",
    fontFamily: "inherit",
    color: "inherit",
  },
  rowActive: { background: "#f4f6fb" },
  rowUnread: { background: "#fbfcfe" },
  rowTop: { display: "flex", alignItems: "center", gap: 6 },
  typeDot: { width: 7, height: 7, borderRadius: "50%", flexShrink: 0 },
  from: { fontSize: 12, fontWeight: 700, color: "#444" },
  typePill: { fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 99 },
  time: { marginLeft: "auto", fontSize: 11, color: "#aaa", flexShrink: 0 },
  subject: { fontSize: 14, fontWeight: 600, color: "#1a1a1a", lineHeight: 1.35 },
  preview: {
    fontSize: 12.5,
    color: "#8a8a85",
    lineHeight: 1.45,
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
  },
  rowFoot: { display: "flex", alignItems: "center", gap: 8, marginTop: 2 },
  docLink: {
    fontSize: 11,
    color: "#2563eb",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  actionBadge: {
    marginLeft: "auto",
    fontSize: 10,
    fontWeight: 700,
    color: "#b45309",
    background: "#fef3c7",
    padding: "1px 6px",
    borderRadius: 99,
  },
};
