"use client";

import { apiFetch } from "@/firebase/apiFetch";

import { useEffect, useState } from "react";
import Link from "@/components/loading/NavigationLink";
import RouteLoading from "@/components/loading/RouteLoading";
import { useLoadingRouter as useRouter } from "@/app/hooks/useNavigationLoading";
import { useAuth } from "@/app/hooks/useAuth";
import { useDocumentStore } from "@/stores/documentStore";

export default function DocumentsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const documentsLoaded = useDocumentStore((state) => state.documentsLoaded);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const documents = useDocumentStore((state) => state.documents);
  const setDocuments = useDocumentStore((state) => state.setDocuments);
  const addDocument = useDocumentStore((state) => state.addDocument);
  const removeDocument = useDocumentStore((state) => state.removeDocument);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [showNewInput, setShowNewInput] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  // Auth guard
  useEffect(() => {
    if (!authLoading && !user) router.push("/auth/signin");
  }, [user, authLoading, router]);

  // Load docs
  useEffect(() => {
    if (!user?.uid) return;
    const controller = new AbortController();
    let active = true;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await apiFetch(`/api/documents?userId=${user.uid}`, { signal: controller.signal });
        if (!res.ok) throw new Error("Could not load your documents. Please reload to retry.");
        if (res.ok) {
          const { documents: docs } = await res.json();
          if (active) setDocuments(docs);
        }
      } catch (err) {
        if (active && err.name !== "AbortError") setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; controller.abort(); };
  }, [user?.uid, setDocuments, loadAttempt]);

  const handleCreate = async () => {
    if (!user?.uid || creating) return;
    const title = newTitle.trim() || "Untitled";
    setCreating(true);
    setError("");
    try {
      const res = await apiFetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.uid, title }),
      });
      if (!res.ok) throw new Error("Could not create the document. Please retry.");
      if (res.ok) {
        const { document } = await res.json();
        addDocument(document);
        setNewTitle("");
        setShowNewInput(false);
        router.push(`/document/${document.id}`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (docId) => {
    if (!user?.uid || deletingId) return;
    setDeletingId(docId);
    setError("");
    try {
      const response = await apiFetch(`/api/documents/${docId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.uid }),
      });
      if (!response.ok) throw new Error("Could not delete the document. Please retry.");
      removeDocument(docId);
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (ts) => {
    if (!ts) return "";
    // Firestore server timestamps arrive as { seconds, nanoseconds }
    const seconds = ts.seconds ?? ts._seconds;
    const ms = seconds != null ? seconds * 1000 : ts;
    return new Date(ms).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (authLoading || !user || (loading && !documentsLoaded && documents.length === 0)) {
    return <RouteLoading label="Opening your documents" />;
  }

  return (
    <div style={styles.page}>
      {error && <p role="alert" style={{ color: "#b91c1c" }}>{error} <button onClick={() => setLoadAttempt(value => value + 1)}>Retry</button></p>}
      {loading && <p role="status">Refreshing documents...</p>}
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.pageTitle}>Your Documents</h1>
          <p style={styles.pageSubtitle}>
            Each document is a full business model canvas for one idea.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button
            onClick={() => setShowNewInput(true)}
            style={styles.primaryBtn}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#333")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#1a1a1a")}
          >
            + New Document
          </button>
        </div>
      </div>

      {/* New doc input */}
      {showNewInput && (
        <div style={styles.newDocRow}>
          <input
            autoFocus
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Document title…"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreate();
              if (e.key === "Escape") {
                setShowNewInput(false);
                setNewTitle("");
              }
            }}
            style={styles.input}
          />
          <button
            onClick={handleCreate}
            disabled={creating}
            style={{
              ...styles.primaryBtn,
              opacity: creating ? 0.6 : 1,
              cursor: creating ? "not-allowed" : "pointer",
            }}
          >
            {creating ? "Creating…" : "Create"}
          </button>
          <button
            onClick={() => {
              setShowNewInput(false);
              setNewTitle("");
            }}
            style={styles.ghostBtn}
          >
            Cancel
          </button>
        </div>
      )}

      {/* Docs grid */}
      {documents.length === 0 ? (
        <div style={styles.emptyState}>
          <p style={{ fontSize: 32, margin: "0 0 12px" }}>📄</p>
          <p style={styles.emptyTitle}>No documents yet</p>
          <p style={styles.emptySubtitle}>
            Create your first business model canvas to get started.
          </p>
          <button
            onClick={() => setShowNewInput(true)}
            style={{ ...styles.primaryBtn, marginTop: 16 }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#333")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#1a1a1a")}
          >
            + New Document
          </button>
        </div>
      ) : (
        <div style={styles.grid}>
          {documents.map((doc) => (
            <div
              key={doc.id}
              style={styles.docCard}
              onMouseEnter={(e) =>
                (e.currentTarget.style.boxShadow =
                  "0 4px 20px rgba(0,0,0,0.08)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)")
              }
            >
              <Link
                href={`/document/${doc.id}`}
                style={styles.docCardMain}
              >
                <span style={styles.docIcon}>📄</span>
                <div style={{ minWidth: 0 }}>
                  <p style={styles.docTitle}>{doc.title || "Untitled"}</p>
                  <p style={styles.docDate}>{formatDate(doc.createdAt)}</p>
                </div>
              </Link>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (
                    confirm(`Delete "${doc.title || "Untitled"}"? This cannot be undone.`)
                  ) {
                    handleDelete(doc.id);
                  }
                }}
                disabled={deletingId !== null}
                title="Delete document"
                style={styles.deleteBtn}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#fee2e2")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                {deletingId === doc.id ? "…" : "🗑"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#ffffff",
    padding: "48px 48px 80px",
    fontFamily:
      "'Poppins', ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    maxWidth: 900,
    margin: "0 auto",
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 40,
    gap: 16,
    flexWrap: "wrap",
  },
  pageTitle: {
    margin: "0 0 6px",
    fontSize: 30,
    fontWeight: 800,
    color: "#1a1a1a",
    letterSpacing: "-0.5px",
  },
  pageSubtitle: {
    margin: 0,
    fontSize: 14,
    color: "#999",
  },
  primaryBtn: {
    padding: "9px 18px",
    fontSize: 13,
    fontWeight: 600,
    color: "white",
    background: "#1a1a1a",
    border: "none",
    borderRadius: 7,
    cursor: "pointer",
    transition: "background 0.15s",
    whiteSpace: "nowrap",
  },
  ghostBtn: {
    padding: "9px 16px",
    fontSize: 13,
    fontWeight: 500,
    color: "#666",
    background: "transparent",
    border: "1px solid #e0e0de",
    borderRadius: 7,
    cursor: "pointer",
  },
  newDocRow: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    marginBottom: 32,
    padding: "16px",
    background: "#fafafa",
    borderRadius: 8,
    border: "1px solid #e8e8e6",
  },
  input: {
    flex: 1,
    padding: "8px 12px",
    fontSize: 14,
    border: "1px solid #ddd",
    borderRadius: 6,
    outline: "none",
    fontFamily: "inherit",
    color: "#1a1a1a",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: 16,
  },
  docCard: {
    display: "flex",
    alignItems: "center",
    border: "1px solid #e8e8e6",
    borderRadius: 10,
    overflow: "hidden",
    background: "white",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
    transition: "box-shadow 0.2s",
  },
  docCardMain: {
    textDecoration: "none",
    color: "inherit",
    flex: 1,
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "18px 16px",
    background: "none",
    border: "none",
    cursor: "pointer",
    textAlign: "left",
    minWidth: 0,
  },
  docIcon: {
    fontSize: 22,
    flexShrink: 0,
  },
  docTitle: {
    margin: "0 0 3px",
    fontSize: 14,
    fontWeight: 600,
    color: "#1a1a1a",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  docDate: {
    margin: 0,
    fontSize: 12,
    color: "#aaa",
  },
  deleteBtn: {
    padding: "0 14px",
    alignSelf: "stretch",
    background: "transparent",
    border: "none",
    borderLeft: "1px solid #f0f0ee",
    cursor: "pointer",
    fontSize: 14,
    color: "#bbb",
    transition: "background 0.15s",
    display: "flex",
    alignItems: "center",
  },
  emptyState: {
    textAlign: "center",
    padding: "80px 24px",
    color: "#aaa",
  },
  emptyTitle: {
    margin: "0 0 6px",
    fontSize: 18,
    fontWeight: 600,
    color: "#555",
  },
  emptySubtitle: {
    margin: 0,
    fontSize: 14,
    color: "#aaa",
  },
  centered: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    color: "#aaa",
    fontSize: 24,
  },
  spinner: {
    display: "inline-block",
    animation: "spin 1s linear infinite",
  },
};
