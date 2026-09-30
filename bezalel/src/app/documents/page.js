"use client";

import { apiFetch } from "@/firebase/apiFetch";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter as useNextRouter, useSearchParams } from "next/navigation";
import { useLoadingRouter as useRouter } from "@/app/hooks/useNavigationLoading";
import RouteLoading from "@/components/loading/RouteLoading";
import { useAuth } from "@/app/hooks/useAuth";
import { useDocumentStore } from "@/stores/documentStore";
import { useInboxStore } from "@/stores/inboxStore";
import InboxRail from "@/components/inbox/InboxRail";
import MessageList from "@/components/inbox/MessageList";
import MessageDetail from "@/components/inbox/MessageDetail";
import ToolBranch from "@/components/inbox/ToolBranch";
import BusinessPlanning from "@/components/inbox/BusinessPlanning";
import DigestPanel from "@/components/inbox/DigestPanel";

const DocumentWorkspace = dynamic(() => import("@/components/document/DocumentWorkspace"), {
  ssr: false,
  loading: () => <InlineLoading label="Opening workspace…" />,
});

const FONT_FAMILY =
  "'Poppins', ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

export default function DocumentsPage() {
  return (
    <Suspense fallback={<InlineLoading label="Opening your inbox…" />}>
      <InboxShell />
    </Suspense>
  );
}

function InboxShell() {
  const nextRouter = useNextRouter();
  const searchParams = useSearchParams();
  const openDocId = searchParams.get("doc");
  const openTool = searchParams.get("tool");

  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const documentsLoaded = useDocumentStore((state) => state.documentsLoaded);
  const documents = useDocumentStore((state) => state.documents);
  const setDocuments = useDocumentStore((state) => state.setDocuments);
  const addDocument = useDocumentStore((state) => state.addDocument);
  const removeDocument = useDocumentStore((state) => state.removeDocument);
  const updateDocument = useDocumentStore((state) => state.updateDocument);

  const messages = useInboxStore((state) => state.messages);
  const setMessages = useInboxStore((state) => state.setMessages);
  const markRead = useInboxStore((state) => state.markRead);
  const markUnread = useInboxStore((state) => state.markUnread);
  const markAllRead = useInboxStore((state) => state.markAllRead);
  const removeMessage = useInboxStore((state) => state.removeMessage);
  const removeMessagesForDocument = useInboxStore((state) => state.removeMessagesForDocument);

  const [loadAttempt, setLoadAttempt] = useState(0);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  const [collapsed, setCollapsed] = useState(false);
  const [activeFilter, setActiveFilter] = useState("inbox");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [branch, setBranch] = useState(null);
  const [digestOpen, setDigestOpen] = useState(false);
  const [planningOpen, setPlanningOpen] = useState(false);
  const [activityError, setActivityError] = useState("");

  const paneRef = useRef(null);

  // Restore the rail's collapsed choice between visits.
  useEffect(() => {
    try {
      setCollapsed(window.localStorage.getItem("bezalel-inbox-rail") === "collapsed");
    } catch {}
  }, []);
  const toggleCollapsed = () =>
    setCollapsed((current) => {
      const next = !current;
      try {
        window.localStorage.setItem("bezalel-inbox-rail", next ? "collapsed" : "expanded");
      } catch {}
      return next;
    });

  // Auth guard
  useEffect(() => {
    if (!authLoading && !user) router.replace("/auth/signin");
  }, [user, authLoading, router]);

  // Load documents
  useEffect(() => {
    if (!user?.uid) return;
    const controller = new AbortController();
    let active = true;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await apiFetch(`/api/documents?userId=${user.uid}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Could not load your documents. Please reload to retry.");
        const { documents: docs } = await res.json();
        if (active) setDocuments(docs);
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
  }, [user?.uid, setDocuments, loadAttempt]);

  // Empty inboxes stay empty; failed reads are surfaced without demo messages.
  useEffect(() => {
    if (!user?.uid || !documentsLoaded) return;
    const controller = new AbortController();
    let active = true;
    setActivityError("");
    const load = async () => {
      try {
        const res = await apiFetch(`/api/activity?userId=${user.uid}`, { signal: controller.signal });
        if (!res.ok) throw new Error("Could not load your inbox. Please retry.");
        const { messages: real } = await res.json();
        if (!Array.isArray(real)) throw new Error("Could not load your inbox. Please retry.");
        if (active) setMessages(real);
      } catch (err) {
        if (active && err.name !== "AbortError") setActivityError(err.message);
      }
    };
    load();
    return () => { active = false; controller.abort(); };
  }, [user?.uid, documentsLoaded, setMessages, loadAttempt]);

  const openDoc = (id, tool) => {
    if (!id) return;
    setDigestOpen(false);
    const params = new URLSearchParams();
    params.set("doc", id);
    if (tool) params.set("tool", tool);
    nextRouter.replace(`/documents?${params.toString()}`, { scroll: false });
  };
  const closeDoc = () => {
    nextRouter.replace("/documents", { scroll: false });
  };

  const handleCreate = async (title) => {
    if (!user?.uid || creating) return;
    const finalTitle = (title ?? "").trim() || "Untitled";
    setCreating(true);
    setError("");
    try {
      const res = await apiFetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.uid, title: finalTitle }),
      });
      if (!res.ok) throw new Error("Could not create the document. Please retry.");
      const { document } = await res.json();
      addDocument(document);
      openDoc(document.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleRename = async (docId, title) => {
    if (!user?.uid) return;
    const trimmed = (title ?? "").trim();
    if (!trimmed) return;
    setError("");
    try {
      const response = await apiFetch(`/api/documents/${docId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.uid, title: trimmed }),
      });
      if (!response.ok) throw new Error("Could not rename the document. Please retry.");
      updateDocument(docId, { title: trimmed });
    } catch (err) {
      setError(err.message);
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
      removeMessagesForDocument(docId);
      if (activeFilter === `doc:${docId}`) setActiveFilter("inbox");
      if (openDocId === docId) closeDoc();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredMessages = useMemo(() => {
    return messages
      .filter((message) => {
        if (activeFilter === "needs_action" && !message.requiresAction) return false;
        if (activeFilter.startsWith("doc:") && message.documentId !== activeFilter.slice(4)) {
          return false;
        }
        if (typeFilter !== "All" && message.type !== typeFilter) return false;
        if (search) {
          const haystack =
            `${message.subject} ${message.preview} ${message.source} ${message.category ?? ""}`.toLowerCase();
          if (!haystack.includes(search.toLowerCase())) return false;
        }
        return true;
      })
      .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  }, [messages, activeFilter, typeFilter, search]);

  const selectedMessage =
    filteredMessages.find((m) => m.id === selectedMessageId) ?? filteredMessages[0] ?? null;

  const unreadCount = useMemo(
    () => messages.filter((m) => m.status === "unread").length,
    [messages],
  );

  const persistStatus = (id, status) => {
    if (!id) return;
    apiFetch("/api/activity", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user?.uid, activityId: id, status }),
    }).catch(() => {});
  };
  const persistRemove = (id) => {
    if (!id) return;
    apiFetch("/api/activity", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user?.uid, activityId: id }),
    }).catch(() => {});
  };

  const handleSelect = (id) => {
    setPlanningOpen(false);
    setSelectedMessageId(id);
    setDigestOpen(false);
    markRead(id);
    persistStatus(id, "read");
    if (openDocId) closeDoc();
  };

  const handleOpenPlanning = () => {
    setPlanningOpen(true);
    setDigestOpen(false);
    if (openDocId) closeDoc();
  };

  const handleOpenDigest = () => {
    setPlanningOpen(false);
    setDigestOpen(true);
    if (openDocId) closeDoc();
  };

  const handleSelectFilter = (filter) => {
    setPlanningOpen(false);
    if (openDocId) closeDoc();
    setDigestOpen(false);
    setActiveFilter(filter);
  };

  const handleMarkAllRead = () => {
    messages.forEach((m) => {
      if (m.status === "unread") persistStatus(m.id, "read");
    });
    markAllRead();
  };

  const handleOpen = (message) => {
    if (!message?.documentId) return;
    const row = document.querySelector(`[data-message-id="${message.id}"]`);
    const sourceRect = row ? row.getBoundingClientRect() : null;
    const targetRect = paneRef.current ? paneRef.current.getBoundingClientRect() : null;
    setBranch({ message, sourceRect, targetRect });
  };

  const handleChoose = (tool) => {
    const docId = branch?.message?.documentId;
    setBranch(null);
    if (docId) openDoc(docId, tool);
  };

  if (authLoading || !user || (loading && !documentsLoaded && documents.length === 0)) {
    return <RouteLoading label="Opening your inbox" />;
  }

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        backgroundColor: "#ffffff",
        fontFamily: FONT_FAMILY,
      }}
    >
      <InboxRail
        documents={documents}
        messages={messages}
        activeFilter={activeFilter}
        onSelectFilter={handleSelectFilter}
        onOpenDocument={(id) => openDoc(id)}
        onOpenPlanning={handleOpenPlanning}
        planningActive={planningOpen}
        onOpenDigest={handleOpenDigest}
        digestActive={digestOpen}
        collapsed={collapsed}
        onToggleCollapsed={toggleCollapsed}
        onCreateDocument={handleCreate}
        onDeleteDocument={handleDelete}
        onRenameDocument={handleRename}
        creating={creating}
        deletingId={deletingId}
        error={error}
      />

      {!planningOpen && <MessageList
        messages={filteredMessages}
        selectedId={selectedMessage?.id ?? null}
        onSelect={handleSelect}
        search={search}
        onSearchChange={setSearch}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        onMarkAllRead={handleMarkAllRead}
        unreadCount={unreadCount}
      />}

      <div ref={paneRef} style={{ flex: 1, minWidth: 0, display: "flex", position: "relative" }}>
        {planningOpen ? (
          <BusinessPlanning documents={documents} onOpen={(id) => openDoc(id, "canvas")} onCreate={handleCreate} creating={creating} error={error} />
        ) : activityError && !digestOpen ? (
          <section style={{ padding: 32 }}><p role="alert">{activityError}</p><button onClick={() => setLoadAttempt(value => value + 1)}>Retry inbox</button><button onClick={handleOpenPlanning}>Open business planning</button></section>
        ) : digestOpen ? (
          <DigestPanel />
        ) : (
          <MessageDetail
            message={selectedMessage}
            onOpenPlanning={handleOpenPlanning}
            onOpen={() => handleOpen(selectedMessage)}
            onMarkRead={() => {
              if (!selectedMessage) return;
              markRead(selectedMessage.id);
              persistStatus(selectedMessage.id, "read");
            }}
            onMarkUnread={() => {
              if (!selectedMessage) return;
              markUnread(selectedMessage.id);
              persistStatus(selectedMessage.id, "unread");
            }}
            onDismiss={() => {
              if (!selectedMessage) return;
              removeMessage(selectedMessage.id);
              persistRemove(selectedMessage.id);
            }}
          />
        )}
      </div>

      {branch && (
        <ToolBranch
          message={branch.message}
          sourceRect={branch.sourceRect}
          targetRect={branch.targetRect}
          onChoose={handleChoose}
          onClose={() => setBranch(null)}
        />
      )}

      {openDocId && (
        <DocumentWorkspace
          mode="modal"
          docId={openDocId}
          key={openDocId}
          tool={openTool === "outreach" ? "outreach" : "canvas"}
          onToolChange={(nextTool) => openDoc(openDocId, nextTool)}
          onClose={closeDoc}
        />
      )}
    </div>
  );
}

function InlineLoading({ label }) {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#aaa",
        fontFamily: FONT_FAMILY,
      }}
    >
      <p style={{ fontSize: 14, margin: 0 }}>{label}</p>
    </div>
  );
}
