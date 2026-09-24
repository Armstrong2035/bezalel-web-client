"use client";

import { apiFetch } from "@/firebase/apiFetch";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/app/hooks/useAuth";
import ThinkingBlock from "./ThinkingBlock";

const REASONING_PREFIX = "__REASONING__:";

/**
 * Parses the reasoning preamble from the first chunk of the stream.
 * Returns { reasoningSteps, remainder } where remainder is the text
 * after stripping the preamble line.
 */
function extractReasoningPreamble(text) {
  const newlineIdx = text.indexOf("\n");
  if (newlineIdx === -1) return { reasoningSteps: null, remainder: text };

  const firstLine = text.slice(0, newlineIdx);
  if (!firstLine.startsWith(REASONING_PREFIX)) {
    return { reasoningSteps: null, remainder: text };
  }

  try {
    const json = JSON.parse(firstLine.slice(REASONING_PREFIX.length));
    return {
      reasoningSteps: json.steps ?? [],
      remainder: text.slice(newlineIdx + 1),
    };
  } catch {
    return { reasoningSteps: null, remainder: text.slice(newlineIdx + 1) };
  }
}

export default function DocChat({
  docId,
  documentSnapshot,
  initialMessage,
  ideas = [],
  onDecisionChange,
  workspaceMode = false,
  onClose,
}) {
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState(initialMessage ?? "");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [error, setError] = useState(null);
  const [showCanvasAction, setShowCanvasAction] = useState(false);
  const [selectedIdeaId, setSelectedIdeaId] = useState(ideas[0]?.id ?? "");
  const [canvasActionStatus, setCanvasActionStatus] = useState("now");
  const [canvasActionError, setCanvasActionError] = useState(null);
  const [canvasActionReason, setCanvasActionReason] = useState("");
  const [isInferringCanvasAction, setIsInferringCanvasAction] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const abortRef = useRef(null);

  const hasContext = workspaceMode || !!documentSnapshot?.context?.idea?.trim();
  const chatEndpoint = workspaceMode ? "/api/workspace-chat" : "/api/chat";

  // ── Load history ─────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.uid || !docId) return;
    const controller = new AbortController();
    let active = true;
    setMessages([]);
    setError(null);
    const load = async () => {
      setIsLoadingHistory(true);
      try {
        const res = await apiFetch(
          workspaceMode
            ? `/api/workspace-chat?userId=${user.uid}`
            : `/api/chat?userId=${user.uid}&documentId=${docId}`,
          { signal: controller.signal },
        );
        if (!res.ok) throw new Error("Could not load chat history. Reopen chat to retry.");
        if (res.ok) {
          const { messages: history } = await res.json();
          if (active) setMessages(history ?? []);
        }
      } catch (err) {
        if (active && err.name !== "AbortError") setError(err.message);
      } finally {
        if (active) setIsLoadingHistory(false);
      }
    };
    load();
    return () => {
      active = false;
      controller.abort();
      abortRef.current?.abort();
    };
  }, [user?.uid, docId, workspaceMode]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isLoadingHistory) return;
    const timer = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, [isLoadingHistory]);

  // ── Send ─────────────────────────────────────────────────────────
  const handleSend = async () => {
    const text = input.trim();
    if (!text || isStreaming || !user?.uid) return;

    setInput("");
    setError(null);

    const userMessage = { role: "user", content: text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    // Assistant placeholder — streaming: true, reasoningStreaming: true until preamble parsed
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: "",
        streaming: true,
        reasoningStreaming: true,
        reasoning: null,
      },
    ]);
    setIsStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;
    let reader;

    try {
      const res = await apiFetch(chatEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify(
          workspaceMode
            ? { userId: user.uid, messages: updatedMessages }
            : {
                userId: user.uid,
                documentId: docId,
                messages: updatedMessages,
                documentSnapshot,
              },
        ),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? "Chat request failed");
      }

      reader = res.body.getReader();
      const decoder = new TextDecoder();
      let rawAccumulated = "";
      let reasoningSteps = null;
      let preambleParsed = false;
      let textAccumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        rawAccumulated += decoder.decode(value, { stream: true });

        if (!preambleParsed) {
          // Wait until we have a complete first line
          if (!rawAccumulated.includes("\n")) continue;

          const { reasoningSteps: steps, remainder } =
            extractReasoningPreamble(rawAccumulated);
          reasoningSteps = steps;
          textAccumulated = remainder;
          preambleParsed = true;

          // Update placeholder: reasoning found, stop reasoning-streaming indicator
          setMessages((prev) =>
            prev.map((m, i) =>
              i === prev.length - 1 && m.streaming
                ? {
                    ...m,
                    reasoning: reasoningSteps,
                    reasoningStreaming: false,
                    content: textAccumulated,
                  }
                : m,
            ),
          );
        } else {
          // Append to text content
          textAccumulated = rawAccumulated.slice(
            rawAccumulated.indexOf("\n") + 1,
          );
          setMessages((prev) =>
            prev.map((m, i) =>
              i === prev.length - 1 && m.streaming
                ? { ...m, content: textAccumulated }
                : m,
            ),
          );
        }
      }

      // Finalise
      setMessages((prev) =>
        prev.map((m, i) =>
          i === prev.length - 1 && m.streaming
            ? {
                role: "assistant",
                content: textAccumulated,
                reasoning: reasoningSteps,
                reasoningStreaming: false,
              }
            : m,
        ),
      );
    } catch (err) {
      if (err.name === "AbortError") {
        setMessages((prev) =>
          prev.map((m) =>
            m.streaming
              ? {
                  role: "assistant",
                  content: m.content,
                  reasoning: m.reasoning,
                  reasoningStreaming: false,
                }
              : m,
          ),
        );
      } else {
        setError(err.message ?? "Something went wrong");
        setMessages((prev) => prev.map((m) => m.streaming
          ? { ...m, streaming: false, reasoningStreaming: false }
          : m));
      }
    } finally {
      if (reader) {
        await reader.cancel().catch(() => {});
        reader.releaseLock();
      }
      setIsStreaming(false);
      abortRef.current = null;
    }
  };

  const handleStop = () => abortRef.current?.abort();

  const handleApplyCanvasChange = async () => {
    const idea = ideas.find((item) => item.id === selectedIdeaId);
    if (!idea || !onDecisionChange) return;

    setCanvasActionError(null);
    try {
      await onDecisionChange(idea.id, canvasActionStatus);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Canvas updated: “${idea.title}” is now marked “${canvasActionStatus === "notPursuing" ? "Not pursuing" : canvasActionStatus[0].toUpperCase() + canvasActionStatus.slice(1)}”.`,
        },
      ]);
      setShowCanvasAction(false);
    } catch (err) {
      setCanvasActionError(err.message ?? "The canvas could not be updated.");
    }
  };

  const inferCanvasAction = async () => {
    if (!ideas.length || messages.length === 0) return;
    setIsInferringCanvasAction(true);
    setCanvasActionError(null);
    try {
      const response = await apiFetch("/api/chat/canvas-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages, ideas }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not infer the canvas change.");
      if (result.ideaId) setSelectedIdeaId(result.ideaId);
      if (result.status) setCanvasActionStatus(result.status);
      setCanvasActionReason(result.reason || "");
    } catch (err) {
      setCanvasActionError(err.message ?? "Could not infer the canvas change.");
    } finally {
      setIsInferringCanvasAction(false);
    }
  };

  useEffect(() => {
    if (showCanvasAction) inferCanvasAction();
    // The action panel should read the current conversation once when opened.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showCanvasAction]);

  const handleClearHistory = async () => {
    if (!user?.uid || !confirm("Clear all chat history for this document?"))
      return;
    try {
      const response = await apiFetch(chatEndpoint, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          workspaceMode
            ? { userId: user.uid }
            : { userId: user.uid, documentId: docId },
        ),
      });
      if (!response.ok) throw new Error("Could not clear chat history. Please retry.");
      setMessages([]);
    } catch (err) {
      console.error("Failed to clear chat history:", err);
      setError(err.message);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Render ────────────────────────────────────────────────────────
  return (
    <>
      <div
        onClick={onClose}
        style={{ position: "fixed", inset: 0, zIndex: 40 }}
      />

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "50%",
          minWidth: 400,
          backgroundColor: "#ffffff",
          borderLeft: "1px solid #e8e8e6",
          zIndex: 50,
          display: "flex",
          flexDirection: "column",
          boxShadow: "-8px 0 32px rgba(0,0,0,0.08)",
          animation: "slideIn 0.2s ease-out",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 24px 14px",
            borderBottom: "1px solid #e8e8e6",
            flexShrink: 0,
          }}
        >
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: 15,
                fontWeight: 700,
                color: "#1a1a1a",
                letterSpacing: "-0.3px",
              }}
            >
              {workspaceMode ? "Workspace Chat" : "Canvas Chat"}
            </h3>
            <p style={{ margin: "3px 0 0", fontSize: 12, color: "#999" }}>
              {workspaceMode
                ? "Think across your businesses, ideas, and opportunities"
                : "Ask anything about your business model"}
            </p>
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {messages.length > 0 && (
              <button
                onClick={handleClearHistory}
                style={{
                  padding: "5px 10px",
                  fontSize: 12,
                  color: "#aaa",
                  background: "none",
                  border: "1px solid #e8e8e6",
                  borderRadius: 5,
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#aaa")}
              >
                Clear
              </button>
            )}
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                padding: "6px 8px",
                borderRadius: 4,
                cursor: "pointer",
                fontSize: 18,
                color: "#888",
                lineHeight: 1,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#f0f0f0")
              }
              onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
            >
              ✕
            </button>
          </div>
        </div>

        {!hasContext && !workspaceMode && (
          <div
            style={{
              padding: "10px 20px",
              background: "#fffbeb",
              borderBottom: "1px solid #fde68a",
              fontSize: 12,
              color: "#92400e",
              flexShrink: 0,
            }}
          >
            ⚠️ Add document context first so the AI understands your business.
          </div>
        )}

        {/* Messages */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px 20px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {isLoadingHistory ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px 0",
                color: "#bbb",
                fontSize: 13,
              }}
            >
              Loading history…
            </div>
          ) : messages.length === 0 ? (
            <EmptyState onSelect={(p) => setInput(p)} />
          ) : (
            messages.map((msg, i) => (
              <MessageBubble key={msg.id ?? i} message={msg} />
            ))
          )}

          {error && (
            <div
              style={{
                padding: "10px 14px",
                background: "#fff5f5",
                border: "1px solid #fca5a5",
                borderRadius: 7,
                fontSize: 12,
                color: "#b91c1c",
              }}
            >
              ⚠ {error}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div
          style={{
            borderTop: "1px solid #e8e8e6",
            padding: "12px 16px 16px",
            flexShrink: 0,
            background: "#fafafa",
          }}
          >
          {!workspaceMode && showCanvasAction && (
            <div
              style={{
                marginBottom: 10,
                padding: 12,
                background: "#f4fbf4",
                border: "1px solid #b8d9ba",
                borderRadius: 8,
              }}
            >
              <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 700, color: "#287c2f" }}>
                APPLY A CANVAS CHANGE
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 9 }}>
                <button
                  onClick={inferCanvasAction}
                  disabled={isInferringCanvasAction || messages.length === 0}
                  style={{ ...canvasActionToggleStyle, margin: 0 }}
                >
                  {isInferringCanvasAction ? "Reading conversation…" : "Infer from conversation"}
                </button>
                {canvasActionReason && <span style={{ fontSize: 11, color: "#666" }}>{canvasActionReason}</span>}
              </div>
              <div style={{ display: "flex", gap: 7 }}>
                <select
                  value={selectedIdeaId}
                  onChange={(e) => setSelectedIdeaId(e.target.value)}
                  style={canvasActionSelectStyle}
                  aria-label="Idea to update"
                >
                  {ideas.length === 0 ? (
                    <option value="">No canvas ideas yet</option>
                  ) : (
                    ideas.map((idea) => (
                      <option key={idea.id} value={idea.id}>
                        {idea.segment ? `${idea.segment} · ` : ""}{idea.title}
                      </option>
                    ))
                  )}
                </select>
                <select
                  value={canvasActionStatus}
                  onChange={(e) => setCanvasActionStatus(e.target.value)}
                  style={{ ...canvasActionSelectStyle, flex: "0 0 125px" }}
                  aria-label="New canvas status"
                >
                  <option value="now">Now</option>
                  <option value="later">Later</option>
                  <option value="explore">Explore</option>
                  <option value="notPursuing">Not pursuing</option>
                </select>
                <button
                  onClick={handleApplyCanvasChange}
                  disabled={!selectedIdeaId || ideas.length === 0}
                  style={canvasActionButtonStyle}
                >
                  Apply
                </button>
              </div>
              {canvasActionError && <p style={{ margin: "7px 0 0", fontSize: 11, color: "#b91c1c" }}>{canvasActionError}</p>}
            </div>
          )}
          {!workspaceMode && (
          <button
            onClick={() => setShowCanvasAction((value) => !value)}
            disabled={!hasContext || ideas.length === 0}
            style={canvasActionToggleStyle}
          >
            {showCanvasAction ? "× Close canvas action" : "✦ Change the canvas from chat"}
          </button>
          )}
          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "flex-end",
              background: "white",
              border: "1px solid #e0e0de",
              borderRadius: 10,
              padding: "8px 10px 8px 14px",
            }}
            onFocusCapture={(e) =>
              (e.currentTarget.style.borderColor = "#a0a0f0")
            }
            onBlurCapture={(e) =>
              (e.currentTarget.style.borderColor = "#e0e0de")
            }
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                workspaceMode
                  ? "Think across your work…"
                  : hasContext
                  ? "Ask about your canvas, spot contradictions, brainstorm…"
                  : "Add context to start chatting"
              }
              disabled={!hasContext || isLoadingHistory}
              rows={1}
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                fontSize: 13,
                lineHeight: 1.6,
                color: "#1a1a1a",
                background: "transparent",
                resize: "none",
                fontFamily: "inherit",
                maxHeight: 120,
                overflowY: "auto",
              }}
              onInput={(e) => {
                e.target.style.height = "auto";
                e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
              }}
            />
            {isStreaming ? (
              <button
                onClick={handleStop}
                style={{
                  flexShrink: 0,
                  width: 32,
                  height: 32,
                  borderRadius: 7,
                  border: "none",
                  background: "#f0f0f0",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  color: "#666",
                }}
              >
                ◼
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!input.trim() || !hasContext}
                style={{
                  flexShrink: 0,
                  width: 32,
                  height: 32,
                  borderRadius: 7,
                  border: "none",
                  background:
                    input.trim() && hasContext ? "#1a1a1a" : "#e8e8e6",
                  cursor:
                    input.trim() && hasContext ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  color: input.trim() && hasContext ? "white" : "#bbb",
                }}
              >
                ↑
              </button>
            )}
          </div>
          <p
            style={{
              margin: "6px 0 0",
              fontSize: 11,
              color: "#ccc",
              textAlign: "right",
            }}
          >
            Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>
    </>
  );
}

/* ------------------------------------------------------------------ */

const canvasActionSelectStyle = {
  flex: 1,
  minWidth: 0,
  padding: "7px 8px",
  border: "1px solid #cfe1cf",
  borderRadius: 6,
  background: "white",
  color: "#333",
  fontSize: 12,
};

const canvasActionButtonStyle = {
  flexShrink: 0,
  padding: "7px 11px",
  border: "none",
  borderRadius: 6,
  background: "#287c2f",
  color: "white",
  fontSize: 12,
  fontWeight: 700,
  cursor: "pointer",
};

const canvasActionToggleStyle = {
  display: "block",
  margin: "0 0 9px auto",
  padding: "3px 0",
  border: "none",
  background: "none",
  color: "#287c2f",
  fontSize: 11,
  fontWeight: 600,
  cursor: "pointer",
};

function MessageBubble({ message }) {
  const isUser = message.role === "user";
  const isStreaming = message.streaming;
  const hasReasoning =
    !isUser && (message.reasoning?.length > 0 || message.reasoningStreaming);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: isUser ? "flex-end" : "flex-start",
        gap: 4,
      }}
    >
      {/* Thinking block — only for assistant messages */}
      {hasReasoning && (
        <div style={{ width: "100%" }}>
          <ThinkingBlock
            steps={message.reasoning ?? []}
            isStreaming={!!message.reasoningStreaming}
            variant="chat"
          />
        </div>
      )}

      {/* Message bubble */}
      {(message.content || isStreaming) && (
        <div
          style={{
            maxWidth: "88%",
            padding: "10px 14px",
            borderRadius: isUser ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
            background: isUser ? "#1a1a1a" : "#f4f4f2",
            color: isUser ? "white" : "#1a1a1a",
            fontSize: 13,
            lineHeight: 1.6,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {message.content}
          {isStreaming && !message.reasoningStreaming && (
            <span
              style={{
                display: "inline-block",
                width: 6,
                height: 14,
                background: "#aaa",
                marginLeft: 3,
                borderRadius: 1,
                animation: "blink 0.8s step-end infinite",
                verticalAlign: "text-bottom",
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}

function EmptyState({ onSelect }) {
  const prompts = [
    "What's the weakest link in my canvas right now?",
    "Does my value proposition actually match my customer segment?",
    "What contradictions do you see across my sections?",
    "What am I missing that would make this model more defensible?",
    "How does my revenue model hold up against my cost structure?",
  ];

  return (
    <div style={{ padding: "16px 0" }}>
      <p style={{ margin: "0 0 16px", fontSize: 13, color: "#888" }}>
        Start a conversation about your canvas. Some ideas:
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {prompts.map((p, i) => (
          <button
            key={i}
            onClick={() => onSelect(p)}
            style={{
              padding: "8px 12px",
              background: "#f7f7f5",
              border: "1px solid #e8e8e6",
              borderRadius: 7,
              fontSize: 12,
              color: "#555",
              fontStyle: "italic",
              lineHeight: 1.4,
              cursor: "pointer",
              textAlign: "left",
              fontFamily: "inherit",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#eeeeed")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#f7f7f5")}
          >
            &quot;{p}&quot;
          </button>
        ))}
      </div>
    </div>
  );
}
