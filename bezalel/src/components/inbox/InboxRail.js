"use client";

import { useMemo, useState } from "react";
import Link from "@/components/loading/NavigationLink";
import { useLoadingRouter as useRouter } from "@/app/hooks/useNavigationLoading";
import { MESSAGE_TYPE_META } from "@/stores/inboxMetadata";

/**
 * Left rail of the email shell. Lists the shared views (Inbox, Needs action)
 * and the user's documents as folders. Each folder shows an unread badge and
 * keeps document create/delete within reach.
 */
export default function InboxRail({
  documents,
  messages,
  activeFilter,
  onSelectFilter,
  onOpenDocument,
  onOpenPlanning,
  planningActive,
  onOpenDigest,
  digestActive,
  collapsed,
  onToggleCollapsed,
  onCreateDocument,
  onDeleteDocument,
  onRenameDocument,
  creating,
  deletingId,
  error,
}) {
  const router = useRouter();
  const [showNewInput, setShowNewInput] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [renamingId, setRenamingId] = useState(null);
  const [renameDraft, setRenameDraft] = useState("");

  const { unreadTotal, actionTotal, unreadByDoc } = useMemo(() => {
    let unread = 0;
    let action = 0;
    const byDoc = new Map();
    for (const message of messages) {
      if (message.status === "unread") {
        unread += 1;
        if (message.documentId) {
          byDoc.set(message.documentId, (byDoc.get(message.documentId) ?? 0) + 1);
        }
      }
      if (message.requiresAction) action += 1;
    }
    return { unreadTotal: unread, actionTotal: action, unreadByDoc: byDoc };
  }, [messages]);

  const submitNew = () => {
    onCreateDocument(newTitle.trim() || "Untitled");
    setNewTitle("");
    setShowNewInput(false);
  };

  const submitRename = () => {
    const id = renamingId;
    setRenamingId(null);
    const trimmed = renameDraft.trim();
    if (trimmed && id) onRenameDocument?.(id, trimmed);
  };

  return (
    <aside
      style={{
        width: collapsed ? 60 : 236,
        minWidth: collapsed ? 60 : 236,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#f7f7f5",
        borderRight: "1px solid #e8e8e6",
        padding: "14px 0",
        overflowY: "auto",
        flexShrink: 0,
        transition: "width 180ms ease, min-width 180ms ease",
      }}
    >
      {/* Brand */}
      <div
        style={{
          padding: collapsed ? "0 8px 14px" : "0 14px 14px",
          borderBottom: "1px solid #e8e8e6",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 6,
        }}
      >
        <Link href="/documents" style={{ textDecoration: "none", minWidth: 0 }}>
          <span
            style={{
              fontSize: 15,
              fontWeight: 800,
              color: "#1a1a1a",
              letterSpacing: "-0.3px",
              whiteSpace: "nowrap",
            }}
          >
            {collapsed ? "B" : "Bezalel"}
          </span>
        </Link>
        <button
          onClick={onToggleCollapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand" : "Collapse"}
          style={railStyles.iconBtn}
        >
          {collapsed ? "→" : "←"}
        </button>
      </div>

      {collapsed ? (
        <div style={{ padding: "14px 8px", display: "grid", gap: 8 }}>
          <button onClick={onOpenPlanning} aria-label="Business planning" title="Business planning" style={railStyles.collapsedBtn}>▦</button>
          <button onClick={() => onSelectFilter("inbox")} aria-label="Inbox" title="Inbox" style={railStyles.collapsedBtn}>
            📥
          </button>
          <button onClick={onOpenDigest} aria-label="Daily digest" title="Daily digest" style={railStyles.collapsedBtn}>
            ⏱
          </button>
          <button
            onClick={() => {
              setShowNewInput(false);
              onCreateDocument("Untitled");
            }}
            aria-label="New document"
            title="New document"
            style={{ ...railStyles.collapsedBtn, background: "#1a1a1a", color: "white" }}
          >
            +
          </button>
        </div>
      ) : (
        <>
          {error && <p role="alert" style={{ color: "#b91c1c", padding: "0 14px", fontSize: 12, margin: "10px 0 0" }}>{error}</p>}

          {/* Shared views */}
          <nav style={{ padding: "10px 8px 4px" }}>
            <RailItem active={planningActive} onClick={onOpenPlanning} icon="▦" label="Business planning" />
            <RailItem
              active={!planningActive && !digestActive && activeFilter === "inbox"}
              onClick={() => onSelectFilter("inbox")}
              icon="📥"
              label="Inbox"
              badge={unreadTotal}
            />
            <RailItem
              active={!planningActive && !digestActive && activeFilter === "needs_action"}
              onClick={() => onSelectFilter("needs_action")}
              icon="⚡"
              label="Needs action"
              badge={actionTotal}
              badgeColor="#b45309"
            />
            <RailItem
              active={digestActive}
              onClick={onOpenDigest}
              icon="⏱"
              label="Digest"
            />
          </nav>

          {/* Documents */}
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "#999",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              padding: "12px 14px 4px",
            }}
          >
            Documents
          </div>
          <nav style={{ padding: "2px 8px 6px", display: "grid", gap: 1 }}>
            {documents.length === 0 && (
              <p style={{ margin: 0, padding: "6px 8px", fontSize: 12, color: "#aaa" }}>
                No documents yet.
              </p>
            )}
            {documents.map((doc) => {
              const isRenaming = renamingId === doc.id;
              return (
                <div key={doc.id} style={{ display: "flex", alignItems: "center", gap: 2, position: "relative" }}>
                  {isRenaming ? (
                    <input
                      autoFocus
                      value={renameDraft}
                      onChange={(e) => setRenameDraft(e.target.value)}
                      onBlur={submitRename}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") e.target.blur();
                        if (e.key === "Escape") setRenamingId(null);
                      }}
                      aria-label="Rename document"
                      style={{ ...railStyles.input, flex: 1, marginRight: 2 }}
                    />
                  ) : (
                    <RailItem
                      active={activeFilter === `doc:${doc.id}`}
                      onClick={() => onSelectFilter(`doc:${doc.id}`)}
                      icon="📄"
                      label={doc.title || "Untitled"}
                      badge={unreadByDoc.get(doc.id) ?? 0}
                      onOpen={() => onOpenDocument?.(doc.id)}
                    />
                  )}
                  {!isRenaming && (
                    <button
                      onClick={() => {
                        setRenamingId(doc.id);
                        setRenameDraft(doc.title || "Untitled");
                      }}
                      title="Rename document"
                      aria-label={`Rename ${doc.title || "Untitled"}`}
                      style={railStyles.renameBtn}
                    >
                      ✎
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (confirm(`Delete "${doc.title || "Untitled"}"? This cannot be undone.`)) {
                        onDeleteDocument(doc.id);
                      }
                    }}
                    disabled={deletingId !== null}
                    title="Delete document"
                    aria-label={`Delete ${doc.title || "Untitled"}`}
                    style={railStyles.deleteBtn}
                  >
                    {deletingId === doc.id ? "…" : "×"}
                  </button>
                </div>
              );
            })}
          </nav>

          {/* New document */}
          <div style={{ padding: "8px 8px 0" }}>
            {showNewInput ? (
              <div style={{ display: "grid", gap: 6 }}>
                <input
                  autoFocus
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Document title…"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") submitNew();
                    if (e.key === "Escape") {
                      setShowNewInput(false);
                      setNewTitle("");
                    }
                  }}
                  style={railStyles.input}
                />
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={submitNew} disabled={creating} style={railStyles.createBtn}>
                    {creating ? "Creating…" : "Create"}
                  </button>
                  <button
                    onClick={() => {
                      setShowNewInput(false);
                      setNewTitle("");
                    }}
                    style={railStyles.cancelBtn}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowNewInput(true)} style={railStyles.newDocBtn}>
                + New document
              </button>
            )}
          </div>
        </>
      )}

      {/* Footer */}
      <div style={{ marginTop: "auto", padding: "10px 14px 0", borderTop: "1px solid #e8e8e6" }}>
        {!collapsed && (
          <button
            onClick={() => router.push("/settings")}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#777", fontFamily: "inherit", padding: "4px 0" }}
          >
            👤 Profile
          </button>
        )}
      </div>
    </aside>
  );
}

function RailItem({ active, onClick, icon, label, badge = 0, badgeColor = "#2563eb", onOpen }) {
  return (
    <button
      onClick={onClick}
      onDoubleClick={onOpen}
      title={onOpen ? `${label} — double-click to open workspace` : label}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        width: "100%",
        padding: "6px 8px",
        border: "none",
        borderRadius: 6,
        background: active ? "#e9e9e4" : "transparent",
        color: active ? "#1a1a1a" : "#4a4a4a",
        textAlign: "left",
        cursor: "pointer",
        fontSize: 13,
        fontWeight: active ? 600 : 400,
        fontFamily: "inherit",
        minWidth: 0,
      }}
    >
      <span style={{ fontSize: 14, flexShrink: 0 }}>{icon}</span>
      <span
        style={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          flex: 1,
        }}
      >
        {label}
      </span>
      {badge > 0 && (
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "white",
            background: badgeColor,
            borderRadius: 99,
            padding: "1px 6px",
            minWidth: 18,
            textAlign: "center",
            flexShrink: 0,
          }}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

const railStyles = {
  iconBtn: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    color: "#777",
    fontSize: 15,
    padding: 4,
    flexShrink: 0,
  },
  collapsedBtn: {
    width: 40,
    height: 40,
    border: "1px solid #deded8",
    borderRadius: 8,
    background: "white",
    cursor: "pointer",
    fontSize: 18,
  },
  deleteBtn: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    color: "#c5c5c2",
    fontSize: 16,
    padding: "4px 6px",
    flexShrink: 0,
  },
  renameBtn: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    color: "#b5b5b0",
    fontSize: 14,
    padding: "4px 4px",
    flexShrink: 0,
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "6px 8px",
    fontSize: 13,
    border: "1px solid #ddd",
    borderRadius: 6,
    outline: "none",
    fontFamily: "inherit",
    color: "#1a1a1a",
  },
  createBtn: {
    padding: "5px 10px",
    fontSize: 12,
    fontWeight: 600,
    color: "white",
    background: "#1a1a1a",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },
  cancelBtn: {
    padding: "5px 10px",
    fontSize: 12,
    fontWeight: 500,
    color: "#666",
    background: "transparent",
    border: "1px solid #e0e0de",
    borderRadius: 6,
    cursor: "pointer",
  },
  newDocBtn: {
    width: "100%",
    padding: "7px 10px",
    fontSize: 12,
    fontWeight: 600,
    color: "#444",
    background: "transparent",
    border: "1px dashed #ccc",
    borderRadius: 6,
    cursor: "pointer",
    fontFamily: "inherit",
  },
};
