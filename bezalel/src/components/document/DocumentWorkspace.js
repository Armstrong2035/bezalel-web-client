"use client";

import { apiFetch } from "@/firebase/apiFetch";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLoadingRouter as useRouter } from "@/app/hooks/useNavigationLoading";
import dynamic from "next/dynamic";
import { useAuth } from "@/app/hooks/useAuth";
import { useSegmentsStore } from "@/stores/segmentsStore";
import { useDocumentStore } from "@/stores/documentStore";
import { subscribeToDocumentSegments } from "@/firebase/subscribeToDocumentSegments";
import { canvasSections } from "@/app/segments/canvasSection";
import DocSidebar from "@/components/document/DocSidebar";
import DocumentSection from "@/components/document/DocumentSection";
const SectionOptionsPanel = dynamic(() => import("@/components/document/SectionOptionsPanel"), { loading: () => <LoadingState compact label="Loading panel..." /> });
const DocumentContext = dynamic(() => import("@/components/document/DocumentContext"), { loading: () => <LoadingState compact label="Loading panel..." /> });
import LoadingState from "@/components/loading/LoadingState";
import RouteLoading from "@/components/loading/RouteLoading";
const StudioApp = dynamic(() => import("@/components/studio/StudioApp"), { loading: () => <LoadingState label="Loading studio..." /> });
const OpportunityView = dynamic(() => import("@/components/studio/OpportunityView"), { loading: () => <LoadingState compact label="Loading outreach…" /> });

const DocChat = dynamic(() => import("@/components/document/DocChat"), { loading: () => <LoadingState compact label="Loading panel..." /> });
const DocumentExport = dynamic(() => import("@/components/document/DocumentExport"), { loading: () => <LoadingState compact label="Loading panel..." /> });

/**
 * The full document workspace: sidebar (Business Model / Validation Studio /
 * Chat / Export) plus the canvas or validation studio main area.
 *
 * Rendered both as the standalone `/document/[docId]` route and as a full-screen
 * modal over the email shell (mode "modal"), so document work stays in one place
 * without duplicating logic.
 */
export default function DocumentWorkspace({ docId, mode = "standalone", tool = "canvas", onToolChange, onClose }) {
  const router = useRouter();

  const { user, loading: authLoading } = useAuth();
  const segments = useSegmentsStore((state) => state.segments);
  const setSegments = useSegmentsStore((state) => state.replaceSegments);
  const documents = useDocumentStore((state) => state.documents);
  const upsertDocument = useDocumentStore((state) => state.upsertDocument);
  const updateDocument = useDocumentStore((state) => state.updateDocument);
  const setActiveDocumentId = useDocumentStore(
    (state) => state.setActiveDocumentId,
  );


  // Which section panel is open — also accepts the special keys "context" and "chat"
  const [openPanelKey, setOpenPanelKey] = useState(null);
  // Pre-filled message when chat is opened from a section
  const [chatInitialMessage, setChatInitialMessage] = useState(null);
  // true when the context panel was forced open because generation was attempted without context
  const [contextRequired, setContextRequired] = useState(false);
  // Which segment is regenerating
  const [regeneratingSectionKey, setRegeneratingSectionKey] = useState(null);
  const [exportType, setExportType] = useState(null);
  const [loadedDocument, setLoadedDocument] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [syncError, setSyncError] = useState("");
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [loadedKey, setLoadedKey] = useState(null);
  const documentKey = user?.uid ? `${user.uid}/${docId}` : null;
  const [workspace, setWorkspace] = useState("validation");
  const [validationView, setValidationView] = useState("overview");
  const [locked, setLocked] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");

  // ── derived ──────────────────────────────────────────────────────
  const activeDoc = documents.find((d) => d.id === docId) ?? loadedDocument;
  const docContext = activeDoc?.context ?? null;
  const hasContext = !!docContext?.idea?.trim();

  // ── auth guard ───────────────────────────────────────────────────
  useEffect(() => {
    if (!authLoading && !user) router.push("/auth/signin");
  }, [user, authLoading, router]);

  // Hydrate the complete document before rendering or starting live updates.
  useEffect(() => {
    if (!user?.uid || !docId) return;
    const controller = new AbortController();
    let active = true;
    let unsubscribe = () => {};
    setLoadedKey(null);
    setLoadedDocument(null);
    setLoadError("");
    setSyncError("");
    setSegments({});
    setActiveDocumentId(docId);

    async function load() {
      try {
        const response = await apiFetch(`/api/documents/${encodeURIComponent(docId)}?userId=${encodeURIComponent(user.uid)}`, {
          cache: "no-store", signal: controller.signal,
        });
        const rawBody = await response.text();
        let body = {};
        try {
          body = rawBody ? JSON.parse(rawBody) : {};
        } catch {
          const status = response.status ? ` (${response.status})` : "";
          throw new Error(
            `The document server returned an invalid response${status}. Restart the app and retry.`,
          );
        }
        if (!response.ok) throw new Error(body.error || "Could not load the saved document.");
        if (!body.document || !Array.isArray(body.ideas)) throw new Error("The document response was incomplete. Please retry.");
        if (!active) return;
        upsertDocument(body.document);
        setLoadedDocument(body.document);
        setSegments(Object.fromEntries(body.ideas.map(idea => [idea.id, idea])));
        setLoadedKey(`${user.uid}/${docId}`);
        unsubscribe = subscribeToDocumentSegments(user.uid, docId, data => {
          if (active) { setSegments(data); setSyncError(""); }
        }, () => {
          if (active) setSyncError("Live updates are unavailable. Showing the last loaded canvas.");
        });
      } catch (error) {
        if (active && error.name !== "AbortError") setLoadError(error.message || "Could not load the document.");
      }
    }
    load();
    return () => {
      active = false;
      controller.abort();
      unsubscribe();
      setActiveDocumentId(null);
    };
  }, [user?.uid, docId, loadAttempt, upsertDocument, setActiveDocumentId, setSegments]);

  // ── helpers ──────────────────────────────────────────────────────

  const getDecisionStatus = useCallback(
    (idea) => idea.decisionStatus ?? (idea.accepted ? "now" : "explore"),
    [],
  );

  const ideasBySection = useMemo(() => {
    const map = new Map();
    const values =
      segments && typeof segments === "object" ? Object.values(segments) : [];
    for (const item of values) {
      const key = item.segment;
      if (key == null) continue;
      const list = map.get(key) ?? [];
      list.push(item);
      map.set(key, list);
    }
    for (const list of map.values()) {
      list.sort(
        (a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0),
      );
    }
    return map;
  }, [segments]);

  const nowIdeasBySection = useMemo(() => {
    const map = new Map();
    for (const [key, list] of ideasBySection) {
      map.set(
        key,
        list
          .filter((idea) => getDecisionStatus(idea) === "now")
          .sort(
            (a, b) =>
              (a.priority ?? Number.MAX_SAFE_INTEGER) -
              (b.priority ?? Number.MAX_SAFE_INTEGER),
          ),
      );
    }
    return map;
  }, [ideasBySection, getDecisionStatus]);

  const ideasList = useMemo(() => Object.values(segments ?? {}), [segments]);

  const getIdeasForSection = useCallback(
    (segmentKey) => ideasBySection.get(segmentKey) ?? [],
    [ideasBySection],
  );
  const getNowIdeas = useCallback(
    (segmentKey) => nowIdeasBySection.get(segmentKey) ?? [],
    [nowIdeasBySection],
  );
  const getTopIdea = useCallback(
    (segmentKey) => {
      const ideas = ideasBySection.get(segmentKey) ?? [];
      const nowIdeas = nowIdeasBySection.get(segmentKey) ?? [];
      return nowIdeas[0] ?? ideas.find((i) => i.accepted) ?? ideas[0] ?? null;
    },
    [ideasBySection, nowIdeasBySection],
  );

  // ── panel interactions ───────────────────────────────────────────

  const handleOpenPanel = (sectionKey) => {
    setOpenPanelKey(sectionKey);
    setContextRequired(false);
  };

  const handleOpenContext = (required = false) => {
    setContextRequired(required);
    setOpenPanelKey("context");
  };

  const handleOpenChat = (prefill = null) => {
    setChatInitialMessage(prefill);
    setOpenPanelKey("chat");
  };

  const handleClosePanel = () => {
    setOpenPanelKey(null);
    setContextRequired(false);
    setChatInitialMessage(null);
  };

  const startRenameTitle = () => {
    setTitleDraft(activeDoc?.title ?? "Untitled");
    setEditingTitle(true);
  };

  const commitRenameTitle = async () => {
    setEditingTitle(false);
    const currentTitle = activeDoc?.title ?? "Untitled";
    const trimmed = titleDraft.trim();
    if (!trimmed || trimmed === currentTitle) {
      setTitleDraft(currentTitle);
      return;
    }
    if (!user?.uid) return;
    try {
      const response = await apiFetch(`/api/documents/${docId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.uid, title: trimmed }),
      });
      if (!response.ok) throw new Error("Could not rename the document. Please retry.");
      updateDocument(docId, { title: trimmed });
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleContextSaved = (savedContext) => {
    // Panel will auto-close (non-required) or user can close (required after save)
    if (contextRequired) {
      // Give the user a moment to see "Saved", then close
      setTimeout(() => {
        setOpenPanelKey(null);
        setContextRequired(false);
      }, 900);
    }
  };

  const handleResearchIdea = async (ideaId, idea) => {
    if (!user?.uid) return;
    if (!hasContext) {
      handleOpenContext(true);
      return;
    }
    const res = await apiFetch("/api/research", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.uid,
        documentId: docId,
        ideaId,
        idea,
        context: docContext,
        // Pass full snapshot so reasoning chain has the whole canvas
        documentSnapshot: {
          title: activeDoc?.title ?? "Untitled",
          context: docContext,
          ideas: segments,
        },
      }),
    });
    if (!res.ok) {
      const body = await res.json();
      throw new Error(body.error ?? "Research failed");
    }
    const { reasoningSteps } = await res.json();
    return { reasoningSteps: reasoningSteps ?? [] };
  };

  const handleDeleteIdea = async (ideaId) => {
    if (!user?.uid) return;
    const response = await apiFetch("/api/update-option", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.uid, documentId: docId, ideaId }),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.error || "The idea could not be deleted.");
    }

    // Firestore subscription removes it from segments automatically
  };

  const handleDecisionChange = async (ideaId, decisionStatus) => {
    if (!user?.uid) return;
    const idea = Object.values(segments ?? {}).find(
      (item) => item.id === ideaId,
    );
    const sectionIdeas = idea ? getNowIdeas(idea.segment) : [];
    const priority = decisionStatus === "now" ? sectionIdeas.length + 1 : null;

    const response = await apiFetch("/api/update-option", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.uid,
        documentId: docId,
        ideaId,
        decisionStatus,
        priority,
      }),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.error || "The canvas could not be updated.");
    }
  };

  const handleMovePriority = async (sectionKey, ideaId, direction) => {
    if (!user?.uid) return;
    const nowIdeas = getNowIdeas(sectionKey);
    const currentIndex = nowIdeas.findIndex((idea) => idea.id === ideaId);
    const nextIndex = currentIndex + direction;
    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= nowIdeas.length)
      return;

    const current = nowIdeas[currentIndex];
    const adjacent = nowIdeas[nextIndex];
    const responses = await Promise.all([
      apiFetch("/api/update-option", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          documentId: docId,
          ideaId: current.id,
          decisionStatus: "now",
          priority: nextIndex + 1,
        }),
      }),
      apiFetch("/api/update-option", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          documentId: docId,
          ideaId: adjacent.id,
          decisionStatus: "now",
          priority: currentIndex + 1,
        }),
      }),
    ]);
    if (responses.some(response => !response.ok)) throw new Error("Could not save priority. Please retry.");
  };

  const handleRegenerate = async (sectionKey) => {
    if (!user?.uid || !sectionKey || regeneratingSectionKey) return;

    // Block generation if context is missing — open context panel instead
    if (!hasContext) {
      handleOpenContext(true);
      return;
    }

    setActionError("");
    setRegeneratingSectionKey(sectionKey);
    try {
      const response = await apiFetch("/api/prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context: docContext,
          userId: user.uid,
          documentId: docId,
          segment: sectionKey,
        }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || "Generation failed. Please retry.");
      }
    } catch (err) {
      setActionError(err.message);
    } finally {
      setRegeneratingSectionKey(null);
    }
  };

  // ── render ───────────────────────────────────────────────────────

  if (loadError && !authLoading && user) {
    const content = (
      <div role="alert" style={{ padding: 40, color: "#20201f" }}>
        <h2>Unable to load this document</h2>
        <p>{loadError}</p>
        <button onClick={() => setLoadAttempt(value => value + 1)}>Retry</button>
        <button onClick={() => (onClose ? onClose() : router.push("/documents"))} style={{ marginLeft: 12 }}>Your Documents</button>
      </div>
    );
    if (mode === "modal") {
      return (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {content}
        </div>
      );
    }
    return content;
  }

  if (authLoading || !user || loadedKey !== documentKey) {
    return mode === "modal" ? (
      <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", color: "#aaa" }}>
        <p style={{ fontSize: 14, margin: 0 }}>Restoring your canvas…</p>
      </div>
    ) : (
      <RouteLoading label="Restoring your canvas" />
    );
  }

  const anyPanelOpen = openPanelKey !== null;

  const canvasBody = (
    <div
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: mode === "modal" ? "32px 40px 120px" : "48px 32px 120px",
      }}
    >
      {mode !== "modal" && (
        <h1
          style={{
            fontSize: 32,
            fontWeight: 800,
            color: "#1a1a1a",
            margin: "0 0 8px",
            letterSpacing: "-0.6px",
            lineHeight: 1.2,
          }}
        >
          {activeDoc?.title ?? "Business Model Canvas"}
        </h1>
      )}

      {/* Context status line */}
      {hasContext ? (
        <p
          style={{
            margin: "0 0 48px",
            fontSize: 13,
            color: "#aaa",
            lineHeight: 1.5,
          }}
        >
          <span style={{ color: "#4caf50", marginRight: 4 }}>●</span>
          Context set —{" "}
          <em style={{ color: "#888" }}>
            {docContext.idea.length > 80
              ? docContext.idea.slice(0, 80) + "…"
              : docContext.idea}
          </em>
        </p>
      ) : (
        <div
          style={{
            margin: "0 0 40px",
            padding: "14px 16px",
            background: "#fffbeb",
            border: "1px solid #fde68a",
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <p style={{ margin: 0, fontSize: 13, color: "#92400e" }}>
            ⚠️ <strong>No context set.</strong> Add your business idea to
            enable AI generation.
          </p>
          <button
            onClick={() => handleOpenContext(false)}
            style={{
              padding: "6px 14px",
              fontSize: 12,
              fontWeight: 600,
              color: "white",
              background: "#92400e",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            Add Context
          </button>
        </div>
      )}

      {/* Canvas sections */}
      {canvasSections.map((section) => (
        <DocumentSection
          key={section.key}
          section={section}
          topIdea={getTopIdea(section.key)}
          nowIdeas={getNowIdeas(section.key)}
          isActive={openPanelKey === section.key}
          onOpenPanel={handleOpenPanel}
        />
      ))}
    </div>
  );

  const toolBody =
    tool === "outreach" ? (
      <OpportunityView
        documentId={docId}
        initialForm={activeDoc?.opportunityForm}
        canvasIdeas={Object.values(segments ?? {})}
      />
    ) : (
      canvasBody
    );

  const panels = (
    <>
      {openPanelKey &&
        openPanelKey !== "context" &&
        openPanelKey !== "chat" && (
          <SectionOptionsPanel
            sectionKey={openPanelKey}
            ideas={getIdeasForSection(openPanelKey)}
            onClose={handleClosePanel}
            onDecisionChange={handleDecisionChange}
            onMovePriority={(ideaId, direction) =>
              handleMovePriority(openPanelKey, ideaId, direction)
            }
            onDelete={handleDeleteIdea}
            onResearch={handleResearchIdea}
            onRegenerate={() => handleRegenerate(openPanelKey)}
            isRegenerating={regeneratingSectionKey === openPanelKey}
            onOpenChat={(prefill) => handleOpenChat(prefill)}
          />
        )}

      {openPanelKey === "context" && (
        <DocumentContext
          docId={docId}
          initialContext={docContext}
          onClose={handleClosePanel}
          onSaved={handleContextSaved}
          isRequired={contextRequired}
        />
      )}

      {openPanelKey === "chat" && (
        <DocChat
          docId={docId}
          documentSnapshot={{
            title: activeDoc?.title ?? "Untitled",
            context: docContext,
            ideas: segments,
          }}
          initialMessage={chatInitialMessage}
          ideas={Object.values(segments ?? {})}
          onDecisionChange={handleDecisionChange}
          onOpenContext={() => handleOpenContext(false)}
          onClose={handleClosePanel}
        />
      )}

      {mode !== "modal" && exportType && (
        <DocumentExport
          title={activeDoc?.title ?? "Business Model Canvas"}
          context={docContext}
          ideas={Object.values(segments ?? {})}
          variant={exportType}
          onClose={() => setExportType(null)}
        />
      )}
    </>
  );

  const toasts = (
    <>
      {actionError && <div role="alert" style={{ position: "fixed", top: 16, right: 16, zIndex: 300, padding: 12, background: "#fee2e2", color: "#991b1b" }}>{actionError}<button onClick={() => setActionError("")} style={{ marginLeft: 12 }}>Dismiss</button></div>}
      {syncError && <div role="status" style={{ position: "fixed", bottom: 16, left: mode === "modal" ? 16 : 260, zIndex: 300, padding: 12, background: "#fff5dc", color: "#654500" }}>{syncError}</div>}
    </>
  );

  const segButton = (active) => ({
    border: "none",
    background: active ? "#1a1a1a" : "transparent",
    padding: "7px 14px",
    fontSize: 12.5,
    fontWeight: 600,
    color: active ? "#ffffff" : "#666",
    cursor: "pointer",
    fontFamily: "inherit",
    whiteSpace: "nowrap",
  });
  const headerIconBtn = {
    border: "1px solid #e0e0de",
    background: "#ffffff",
    borderRadius: 7,
    padding: "7px 10px",
    fontSize: 14,
    cursor: "pointer",
    color: "#444",
    lineHeight: 1,
  };

  if (mode === "modal") {
    return (
      <div
        onClick={locked ? undefined : onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 200,
          background: locked ? "#ffffff" : "rgba(20,20,20,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: locked ? 0 : 24,
          transition: "background 0.2s ease, padding 0.2s ease",
        }}
      >
        {toasts}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            width: "100%",
            height: "100%",
            maxWidth: locked ? "none" : 1240,
            background: "#ffffff",
            borderRadius: locked ? 0 : 12,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            boxShadow: locked ? "none" : "0 24px 80px rgba(0,0,0,0.35)",
          }}
        >
          {/* Modal header */}
          <div
            style={{
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 20px",
              borderBottom: "1px solid #e8e8e6",
              background: "#fbfbfa",
            }}
          >
            {editingTitle ? (
              <input
                autoFocus
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                onBlur={commitRenameTitle}
                onKeyDown={(e) => {
                  if (e.key === "Enter") e.target.blur();
                  if (e.key === "Escape") {
                    setEditingTitle(false);
                    setTitleDraft(activeDoc?.title ?? "Untitled");
                  }
                }}
                aria-label="Document title"
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "#1a1a1a",
                  minWidth: 0,
                  maxWidth: 320,
                  border: "1px solid #ddd",
                  borderRadius: 6,
                  padding: "4px 8px",
                  outline: "none",
                  fontFamily: "inherit",
                }}
              />
            ) : (
              <button
                onClick={startRenameTitle}
                title="Click to rename"
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "#1a1a1a",
                  minWidth: 0,
                  maxWidth: 320,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  background: "none",
                  border: "1px solid transparent",
                  borderRadius: 6,
                  padding: "4px 8px",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                📄 {activeDoc?.title ?? "Untitled"}
              </button>
            )}
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  display: "flex",
                  border: "1px solid #e0e0de",
                  borderRadius: 8,
                  overflow: "hidden",
                  flexShrink: 0,
                }}
              >
                <button onClick={() => onToolChange?.("canvas")} style={segButton(tool === "canvas")}>
                  Business Model
                </button>
                <button onClick={() => onToolChange?.("outreach")} style={segButton(tool === "outreach")}>
                  Outreach
                </button>
              </div>
              <button
                onClick={() => handleOpenContext(false)}
                aria-label={hasContext ? "Edit business context" : "Add business context"}
                style={{ ...headerIconBtn, fontSize: 13, fontWeight: 600 }}
              >
                {hasContext ? "Edit context" : "Add context"}
              </button>
              <button
                onClick={() => handleOpenChat(null)}
                aria-label="Open canvas chat"
                style={{ ...headerIconBtn, fontSize: 13, fontWeight: 600 }}
              >
                Chat
              </button>
              <button
                onClick={() => setLocked((value) => !value)}
                title={locked ? "Unlock — show your inbox behind this view" : "Lock — focus on this tool full screen"}
                style={headerIconBtn}
              >
                {locked ? "🔒" : "🔓"}
              </button>
              <button onClick={onClose} aria-label="Close" title="Close" style={headerIconBtn}>
                ✕
              </button>
            </div>
          </div>

          {/* Tool body */}
          <div
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: "auto",
              transition: "filter 0.2s ease",
              filter: anyPanelOpen ? "blur(3px)" : "none",
              pointerEvents: anyPanelOpen ? "none" : "auto",
            }}
          >
            {toolBody}
          </div>

          {panels}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flex: 1, minWidth: 0, overflow: "hidden" }}>
      {toasts}
      <DocSidebar
        docId={docId}
        docTitle={activeDoc?.title ?? "Untitled"}
        hasContext={hasContext}
        onOpenContext={() => handleOpenContext(false)}
        onOpenChat={() => handleOpenChat(null)}
        onOpenBusinessModel={() => setWorkspace("canvas")}
        onOpenValidation={() => setWorkspace("validation")}
        workspace={workspace}
        validationView={validationView}
        onValidationViewChange={setValidationView}
        onOpenExportBrief={() => setExportType("brief")}
        onOpenExportCanvas={() => setExportType("canvas")}
      />

      {/* Main scrollable document workspace */}
      <main
        style={{
          flex: 1,
          minWidth: 0,
          minHeight: 0,
          overflowY: "auto",
          transition: "filter 0.2s ease",
          filter: anyPanelOpen ? "blur(3px)" : "none",
          pointerEvents: anyPanelOpen ? "none" : "auto",
        }}
      >
        {workspace === "validation" ? (
          <StudioApp
            document={{
              id: docId,
              opportunityForm: activeDoc?.opportunityForm,
              title: activeDoc?.title ?? "Business Model Canvas",
              goal: docContext?.idea ?? "",
            }}
            onOpenBusinessModel={() => setWorkspace("canvas")}
            hideSidebar
            activeView={validationView}
            onViewChange={setValidationView}
            canvasIdeas={Object.values(segments ?? {})}
          />
        ) : (
          canvasBody
        )}
      </main>
      {panels}
    </div>
  );
}
