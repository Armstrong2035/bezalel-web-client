"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";
import { useSegmentsStore } from "@/stores/segmentsStore";
import { useDocumentStore } from "@/stores/documentStore";
import { subscribeToDocumentSegments } from "@/firebase/subscribeToDocumentSegments";
import { canvasSections } from "@/app/segments/canvasSection";
import DocSidebar from "@/components/document/DocSidebar";
import DocumentSection from "@/components/document/DocumentSection";
import SectionOptionsPanel from "@/components/document/SectionOptionsPanel";
import DocumentContext from "@/components/document/DocumentContext";
import DocChat from "@/components/document/DocChat";

export default function DocumentPage({ params }) {
  const { docId } = use(params);
  const router = useRouter();

  const { user, loading: authLoading } = useAuth();
  const segments = useSegmentsStore((state) => state.segments);
  const setSegments = useSegmentsStore((state) => state.setSegments);
  const documents = useDocumentStore((state) => state.documents);
  const setDocuments = useDocumentStore((state) => state.setDocuments);
  const setActiveDocumentId = useDocumentStore((state) => state.setActiveDocumentId);
  const setDocumentContext = useDocumentStore((state) => state.setDocumentContext);

  // Which section panel is open — also accepts the special keys "context" and "chat"
  const [openPanelKey, setOpenPanelKey] = useState(null);
  // Pre-filled message when chat is opened from a section
  const [chatInitialMessage, setChatInitialMessage] = useState(null);
  // true when the context panel was forced open because generation was attempted without context
  const [contextRequired, setContextRequired] = useState(false);
  // Which segment is regenerating
  const [regeneratingSectionKey, setRegeneratingSectionKey] = useState(null);

  // ── derived ──────────────────────────────────────────────────────
  const activeDoc = documents.find((d) => d.id === docId);
  const docContext = activeDoc?.context ?? null;
  const hasContext = !!(docContext?.idea?.trim());

  // ── auth guard ───────────────────────────────────────────────────
  useEffect(() => {
    if (!authLoading && !user) router.push("/auth/signin");
  }, [user, authLoading, router]);

  // ── subscribe to this doc's canvas segments ──────────────────────
  useEffect(() => {
    if (!user?.uid || !docId) return;
    setActiveDocumentId(docId);

    const unsubscribe = subscribeToDocumentSegments(user.uid, docId, (data) => {
      setSegments(data);
    });

    return () => {
      unsubscribe();
      setActiveDocumentId(null);
    };
  }, [user?.uid, docId, setActiveDocumentId, setSegments]);

  // ── load doc list (+ context) if store is empty ──────────────────
  useEffect(() => {
    if (!user?.uid || documents.length > 0) return;
    fetch(`/api/documents?userId=${user.uid}`)
      .then((r) => r.json())
      .then(({ documents: docs }) => docs && setDocuments(docs))
      .catch(console.error);
  }, [user?.uid, documents.length, setDocuments]);

  // ── if this specific doc is missing from store, fetch it directly ─
  useEffect(() => {
    if (!user?.uid || !docId || activeDoc !== undefined) return;
    fetch(`/api/documents/${docId}/context?userId=${user.uid}`)
      .then((r) => r.json())
      .then(({ context }) => {
        if (context) setDocumentContext(docId, context);
      })
      .catch(console.error);
  }, [user?.uid, docId, activeDoc, setDocumentContext]);

  // ── helpers ──────────────────────────────────────────────────────

  const getIdeasForSection = (segmentKey) => {
    if (!segments || typeof segments !== "object") return [];
    return Object.values(segments)
      .filter((item) => item.segment === segmentKey)
      .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
  };

  const getTopIdea = (segmentKey) => {
    const ideas = getIdeasForSection(segmentKey);
    return ideas.find((i) => i.accepted) ?? ideas[0] ?? null;
  };

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
    const res = await fetch("/api/research", {
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
    await fetch("/api/update-option", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.uid, documentId: docId, ideaId }),
    });
    // Firestore subscription removes it from segments automatically
  };

  const handleAcceptIdea = async (ideaId, accepted) => {
    if (!user?.uid) return;
    await fetch("/api/update-option", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.uid, documentId: docId, ideaId, accepted }),
    });
  };

  const handleRegenerate = async (sectionKey) => {
    if (!user?.uid || !sectionKey) return;

    // Block generation if context is missing — open context panel instead
    if (!hasContext) {
      handleOpenContext(true);
      return;
    }

    setRegeneratingSectionKey(sectionKey);
    try {
      await fetch("/api/prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context: docContext,
          userId: user.uid,
          documentId: docId,
          segment: sectionKey,
        }),
      });
    } catch (err) {
      console.error("Regenerate failed:", err);
    } finally {
      setRegeneratingSectionKey(null);
    }
  };

  // ── render ───────────────────────────────────────────────────────

  if (authLoading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          color: "#aaa",
          fontSize: 14,
        }}
      >
        Loading…
      </div>
    );
  }

  const anyPanelOpen = openPanelKey !== null;

  return (
    <>
      {/* Sidebar */}
      <DocSidebar
        docId={docId}
        docTitle={activeDoc?.title ?? "Untitled"}
        hasContext={hasContext}
        onOpenContext={() => handleOpenContext(false)}
        onOpenChat={() => handleOpenChat(null)}
      />

      {/* Main scrollable doc */}
      <main
        style={{
          flex: 1,
          overflowY: "auto",
          height: "100vh",
          transition: "filter 0.2s ease",
          filter: anyPanelOpen ? "blur(3px)" : "none",
          pointerEvents: anyPanelOpen ? "none" : "auto",
        }}
      >
        <div
          style={{
            maxWidth: 720,
            margin: "0 auto",
            padding: "48px 32px 120px",
          }}
        >
          {/* Doc header */}
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
              <p
                style={{ margin: 0, fontSize: 13, color: "#92400e" }}
              >
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
              isActive={openPanelKey === section.key}
              onOpenPanel={handleOpenPanel}
            />
          ))}
        </div>
      </main>

      {/* Section options panel */}
      {openPanelKey && openPanelKey !== "context" && openPanelKey !== "chat" && (
        <SectionOptionsPanel
          sectionKey={openPanelKey}
          ideas={getIdeasForSection(openPanelKey)}
          onClose={handleClosePanel}
          onAccept={handleAcceptIdea}
          onDelete={handleDeleteIdea}
          onResearch={handleResearchIdea}
          onRegenerate={() => handleRegenerate(openPanelKey)}
          isRegenerating={regeneratingSectionKey === openPanelKey}
          onOpenChat={(prefill) => handleOpenChat(prefill)}
        />
      )}

      {/* Context panel */}
      {openPanelKey === "context" && (
        <DocumentContext
          docId={docId}
          initialContext={docContext}
          onClose={handleClosePanel}
          onSaved={handleContextSaved}
          isRequired={contextRequired}
        />
      )}

      {/* Chat panel */}
      {openPanelKey === "chat" && (
        <DocChat
          docId={docId}
          documentSnapshot={{
            title: activeDoc?.title ?? "Untitled",
            context: docContext,
            ideas: segments,
          }}
          initialMessage={chatInitialMessage}
          onClose={handleClosePanel}
        />
      )}
    </>
  );
}
