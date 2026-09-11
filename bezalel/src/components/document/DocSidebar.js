"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { canvasSections } from "@/app/segments/canvasSection";
import { useDocumentStore } from "@/stores/documentStore";
import { useAuth } from "@/app/hooks/useAuth";

/**
 * Left sidebar for the document view.
 *
 * Props:
 *   docId        — active document id
 *   docTitle     — current title (rendered + editable)
 *   hasContext   — whether the doc has a saved context; drives the indicator dot
 *   onOpenContext — callback to open the context panel in the parent
 */
export default function DocSidebar({ docId, docTitle, hasContext, onOpenContext, onOpenChat }) {
  const router = useRouter();
  const { user } = useAuth();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(docTitle || "Untitled");
  const updateDocument = useDocumentStore((state) => state.updateDocument);
  const addDocument = useDocumentStore((state) => state.addDocument);

  const handleTitleBlur = async () => {
    setIsEditingTitle(false);
    const trimmed = titleDraft.trim();
    if (!trimmed) return;
    updateDocument(docId, { title: trimmed });
    await fetch(`/api/documents/${docId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user?.uid, title: trimmed }),
    });
  };

  const handleNewDoc = async () => {
    if (!user?.uid) return;
    const res = await fetch("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.uid, title: "Untitled" }),
    });
    if (res.ok) {
      const { document } = await res.json();
      addDocument(document);
      router.push(`/document/${document.id}`);
    }
  };

  return (
    <aside
      style={{
        width: 240,
        minWidth: 240,
        height: "100vh",
        position: "sticky",
        top: 0,
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#f7f7f5",
        borderRight: "1px solid #e8e8e6",
        padding: "16px 0",
        overflowY: "auto",
        zIndex: 10,
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div style={{ padding: "0 16px 16px", borderBottom: "1px solid #e8e8e6" }}>
        <Link href="/documents" style={{ textDecoration: "none" }}>
          <span
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "#1a1a1a",
              letterSpacing: "-0.3px",
            }}
          >
            Bezalel
          </span>
        </Link>
      </div>

      {/* Editable doc title */}
      <div style={{ padding: "12px 16px 8px" }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "#999",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: 6,
          }}
        >
          Document
        </div>

        {isEditingTitle ? (
          <input
            autoFocus
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.target.blur();
              if (e.key === "Escape") {
                setTitleDraft(docTitle);
                setIsEditingTitle(false);
              }
            }}
            style={{
              width: "100%",
              fontSize: 13,
              fontWeight: 500,
              color: "#1a1a1a",
              background: "white",
              border: "1px solid #ddd",
              borderRadius: 4,
              padding: "4px 6px",
              outline: "none",
              fontFamily: "inherit",
            }}
          />
        ) : (
          <button
            onClick={() => setIsEditingTitle(true)}
            title="Click to rename"
            style={{
              background: "none",
              border: "none",
              padding: "4px 6px",
              borderRadius: 4,
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 500,
              color: "#1a1a1a",
              textAlign: "left",
              width: "100%",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              transition: "background 0.15s",
              fontFamily: "inherit",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#eeeeed")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
          >
            📄 {titleDraft || "Untitled"}
          </button>
        )}
      </div>

      {/* Context link — sits just below the doc title */}
      <div style={{ padding: "0 8px 8px", borderBottom: "1px solid #e8e8e6" }}>
        <button
          onClick={onOpenContext}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "none",
            border: "none",
            borderRadius: 4,
            padding: "5px 8px",
            cursor: "pointer",
            fontSize: 13,
            color: hasContext ? "#4a4a4a" : "#92400e",
            width: "100%",
            textAlign: "left",
            transition: "background 0.12s",
            fontFamily: "inherit",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#eeeeed")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
        >
          {/* Indicator dot */}
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: hasContext ? "#4caf50" : "#f59e0b",
              flexShrink: 0,
              display: "inline-block",
            }}
          />
          Context
          {!hasContext && (
            <span
              style={{
                marginLeft: "auto",
                fontSize: 10,
                fontWeight: 700,
                color: "#92400e",
                background: "#fef3c7",
                padding: "1px 5px",
                borderRadius: 99,
              }}
            >
              needed
            </span>
          )}
        </button>
      </div>

      {/* Section anchors */}
      <div style={{ padding: "4px 0", flex: 1 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "#999",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            padding: "8px 16px 4px",
          }}
        >
          Sections
        </div>
        {canvasSections.map((section) => {
          const Icon = section.icon;
          return (
            <a
              key={section.key}
              href={`#${section.key}`}
              style={{ textDecoration: "none" }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "5px 16px",
                  fontSize: 13,
                  color: "#4a4a4a",
                  cursor: "pointer",
                  transition: "background 0.12s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#eeeeed")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <Icon style={{ fontSize: 14, color: "#888", flexShrink: 0 }} />
                <span
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {section.title}
                </span>
              </div>
            </a>
          );
        })}
      </div>

      {/* Bottom actions */}
      <div
        style={{
          borderTop: "1px solid #e8e8e6",
          padding: "12px 8px 0",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <SidebarAction
          icon="📋"
          label="All Documents"
          onClick={() => router.push("/documents")}
        />
        <SidebarAction
          icon="💬"
          label="Chat"
          onClick={onOpenChat}
        />
        <SidebarAction
          icon="👤"
          label="Profile"
          onClick={() => router.push("/settings")}
        />
        <SidebarAction
          icon="✚"
          label="New Document"
          onClick={handleNewDoc}
        />
      </div>
    </aside>
  );
}

function SidebarAction({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: "none",
        border: "none",
        borderRadius: 4,
        padding: "6px 8px",
        cursor: "pointer",
        fontSize: 13,
        color: "#4a4a4a",
        width: "100%",
        textAlign: "left",
        transition: "background 0.12s",
        fontFamily: "inherit",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#eeeeed")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
    >
      <span style={{ fontSize: 14 }}>{icon}</span>
      {label}
    </button>
  );
}
