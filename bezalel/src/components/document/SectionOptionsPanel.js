"use client";

import { useState } from "react";
import { canvasSections } from "@/app/segments/canvasSection";
import ThinkingBlock from "./ThinkingBlock";

/**
 * SectionOptionsPanel
 * Right-side sliding panel that appears when a section is clicked.
 * Shows all AI-generated ideas for that section with:
 *   - Select (accept) / deselect per idea
 *   - Scores (easeOfExecution, resourceAlignment, marketFit)
 *   - Regenerate button
 *   - Close button
 * The main doc behind it is blurred via the parent.
 */
export default function SectionOptionsPanel({
  sectionKey,
  ideas = [],
  onClose,
  onAccept,
  onDelete,
  onResearch,
  onRegenerate,
  isRegenerating,
  onOpenChat,
}) {
  const section = canvasSections.find((s) => s.key === sectionKey);
  const [expandedId, setExpandedId] = useState(null);

  if (!section) return null;

  const Icon = section.icon;

  return (
    <>
      {/* Backdrop — clicking it closes the panel */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 40,
          background: "transparent",
        }}
      />

      {/* Panel */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "50%",
          minWidth: 380,
          backgroundColor: "#ffffff",
          borderLeft: "1px solid #e8e8e6",
          zIndex: 50,
          display: "flex",
          flexDirection: "column",
          boxShadow: "-8px 0 32px rgba(0,0,0,0.08)",
          animation: "slideIn 0.2s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Panel header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 24px 16px",
            borderBottom: "1px solid #e8e8e6",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Icon style={{ fontSize: 20, color: "#555" }} />
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#1a1a1a",
                  letterSpacing: "-0.3px",
                }}
              >
                {section.title}
              </h3>
              <p
                style={{
                  margin: 0,
                  fontSize: 12,
                  color: "#999",
                  marginTop: 2,
                }}
              >
                {ideas.length} option{ideas.length !== 1 ? "s" : ""} generated
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {/* Ask in chat */}
            {onOpenChat && (
              <button
                onClick={() =>
                  onOpenChat(`Let's talk about my ${section.title} options.`)
                }
                title="Discuss this section in chat"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "6px 11px",
                  fontSize: 12,
                  fontWeight: 500,
                  color: "#4a4a4a",
                  background: "#f0f0f0",
                  border: "1px solid #e0e0de",
                  borderRadius: 6,
                  cursor: "pointer",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#e4e4e2")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#f0f0f0")}
              >
                💬 Ask
              </button>
            )}

            {/* Regenerate */}
            <button
              onClick={onRegenerate}
              disabled={isRegenerating}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                fontSize: 13,
                fontWeight: 500,
                color: isRegenerating ? "#aaa" : "#4a4a4a",
                background: isRegenerating ? "#f5f5f5" : "#f0f0f0",
                border: "1px solid #e0e0de",
                borderRadius: 6,
                cursor: isRegenerating ? "not-allowed" : "pointer",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => {
                if (!isRegenerating)
                  e.currentTarget.style.background = "#e8e8e6";
              }}
              onMouseLeave={(e) => {
                if (!isRegenerating)
                  e.currentTarget.style.background = "#f0f0f0";
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  animation: isRegenerating ? "spin 1s linear infinite" : "none",
                }}
              >
                ↺
              </span>
              {isRegenerating ? "Generating…" : "Regenerate"}
            </button>

            {/* Close */}
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
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "none")
              }
            >
              ✕
            </button>
          </div>
        </div>

        {/* Ideas list */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px 24px 24px",
          }}
        >
          {ideas.length === 0 && !isRegenerating ? (
            <EmptyState section={section} onGenerate={onRegenerate} />
          ) : isRegenerating && ideas.length === 0 ? (
            <LoadingIdeas />
          ) : (
            ideas.map((idea) => (
              <IdeaCard
                key={idea.id}
                idea={idea}
                isExpanded={expandedId === idea.id}
                onToggleExpand={() =>
                  setExpandedId(expandedId === idea.id ? null : idea.id)
                }
                onAccept={() => onAccept(idea.id, !idea.accepted)}
                onDelete={() => onDelete(idea.id)}
                onResearch={onResearch}
              />
            ))
          )}
          {isRegenerating && ideas.length > 0 && <LoadingIdeas inline />}
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Sub-components                                                        */
/* ------------------------------------------------------------------ */

function IdeaCard({ idea, isExpanded, onToggleExpand, onAccept, onDelete, onResearch }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [activeTab, setActiveTab] = useState("plan"); // "plan" | "assumptions" | "research"
  const [isResearching, setIsResearching] = useState(false);
  const [researchError, setResearchError] = useState(null);
  const [researchReasoningSteps, setResearchReasoningSteps] = useState(null);

  const handleRunResearch = async () => {
    setIsResearching(true);
    setResearchError(null);
    setResearchReasoningSteps(null);
    try {
      const result = await onResearch(idea.id, { title: idea.title, description: idea.description });
      if (result?.reasoningSteps) {
        setResearchReasoningSteps(result.reasoningSteps);
      }
    } catch (err) {
      setResearchError(err.message ?? "Research failed. Try again.");
    } finally {
      setIsResearching(false);
    }
  };

  // Format a Firestore-style timestamp or ISO string
  const formatTimestamp = (ts) => {
    if (!ts) return null;
    const ms = ts.seconds ? ts.seconds * 1000 : typeof ts === "number" ? ts : Date.parse(ts);
    if (isNaN(ms)) return null;
    const diff = Date.now() - ms;
    if (diff < 60000) return "just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  return (
    <div
      style={{
        marginBottom: 12,
        border: `1px solid ${idea.accepted ? "#a0c8a0" : "#e8e8e6"}`,
        borderRadius: 8,
        overflow: "hidden",
        backgroundColor: idea.accepted ? "#f4fbf4" : "#ffffff",
        transition: "border-color 0.2s, background 0.2s",
      }}
    >
      {/* Card header row */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          padding: "14px 16px 12px",
          gap: 12,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              margin: "0 0 4px",
              fontSize: 14,
              fontWeight: 600,
              color: "#1a1a1a",
              lineHeight: 1.35,
            }}
          >
            {idea.title}
          </p>
          <p
            style={{
              margin: 0,
              fontSize: 13,
              color: "#666",
              lineHeight: 1.5,
              display: "-webkit-box",
              WebkitLineClamp: isExpanded ? "unset" : 2,
              WebkitBoxOrient: "vertical",
              overflow: isExpanded ? "visible" : "hidden",
            }}
          >
            {idea.description}
          </p>
        </div>

        {/* Accept toggle */}
        <button
          onClick={onAccept}
          title={idea.accepted ? "Deselect" : "Select this idea"}
          style={{
            flexShrink: 0,
            width: 28,
            height: 28,
            borderRadius: "50%",
            border: `2px solid ${idea.accepted ? "#4caf50" : "#ddd"}`,
            background: idea.accepted ? "#4caf50" : "transparent",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            color: idea.accepted ? "white" : "#ccc",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            if (!idea.accepted) {
              e.currentTarget.style.borderColor = "#4caf50";
              e.currentTarget.style.color = "#4caf50";
            }
          }}
          onMouseLeave={(e) => {
            if (!idea.accepted) {
              e.currentTarget.style.borderColor = "#ddd";
              e.currentTarget.style.color = "#ccc";
            }
          }}
        >
          ✓
        </button>

        {/* Delete — two-step confirm */}
        {confirmDelete ? (
          <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
            <button
              onClick={onDelete}
              title="Confirm delete"
              style={{
                padding: "3px 8px",
                fontSize: 11,
                fontWeight: 600,
                color: "white",
                background: "#ef4444",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
              }}
            >
              Delete
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              title="Cancel"
              style={{
                padding: "3px 8px",
                fontSize: 11,
                color: "#666",
                background: "#f0f0f0",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
              }}
            >
              No
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            title="Delete idea"
            style={{
              flexShrink: 0,
              width: 28,
              height: 28,
              borderRadius: "50%",
              border: "2px solid #ddd",
              background: "transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              color: "#ccc",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#ef4444";
              e.currentTarget.style.color = "#ef4444";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#ddd";
              e.currentTarget.style.color = "#ccc";
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Score chips + expand toggle */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px 12px",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        {idea.scores && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <ScoreChip label="Ease" score={idea.scores.easeOfExecution?.score} />
            <ScoreChip label="Resources" score={idea.scores.resourceAlignment?.score} />
            <ScoreChip label="Market" score={idea.scores.marketFit?.score} />
          </div>
        )}

        <button
          onClick={onToggleExpand}
          style={{
            background: "none",
            border: "none",
            fontSize: 12,
            color: "#999",
            cursor: "pointer",
            padding: "2px 4px",
            borderRadius: 4,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f0f0")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
        >
          {isExpanded ? "Show less ↑" : "Show more ↓"}
        </button>
      </div>

      {/* Expanded detail */}
      {isExpanded && (
        <div style={{ borderTop: "1px solid #f0f0f0" }}>
          {/* Tab bar */}
          <div
            style={{
              display: "flex",
              borderBottom: "1px solid #f0f0f0",
              padding: "0 16px",
            }}
          >
            {[
              { key: "plan", label: "Action Plan" },
              { key: "assumptions", label: "Assumptions" },
              {
                key: "research",
                label: idea.research ? "Research ✓" : "Research",
              },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: "10px 12px",
                  fontSize: 12,
                  fontWeight: activeTab === tab.key ? 600 : 400,
                  color:
                    tab.key === "research" && idea.research
                      ? activeTab === tab.key
                        ? "#4caf50"
                        : "#4caf50aa"
                      : activeTab === tab.key
                      ? "#1a1a1a"
                      : "#aaa",
                  background: "none",
                  border: "none",
                  borderBottom: `2px solid ${
                    activeTab === tab.key
                      ? tab.key === "research" && idea.research
                        ? "#4caf50"
                        : "#1a1a1a"
                      : "transparent"
                  }`,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "color 0.15s",
                  marginBottom: -1,
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div style={{ padding: "14px 16px 16px" }}>
            {activeTab === "plan" && (
              <>
                {idea.actionPlan ? (
                  ["week1", "week2", "week3", "week4"].map((week, i) =>
                    idea.actionPlan[week] ? (
                      <div
                        key={week}
                        style={{ display: "flex", gap: 10, marginBottom: 7 }}
                      >
                        <span
                          style={{
                            flexShrink: 0,
                            fontSize: 12,
                            fontWeight: 600,
                            color: "#aaa",
                            paddingTop: 1,
                          }}
                        >
                          W{i + 1}
                        </span>
                        <span style={{ fontSize: 13, color: "#444", lineHeight: 1.5 }}>
                          {idea.actionPlan[week]}
                        </span>
                      </div>
                    ) : null
                  )
                ) : (
                  <p style={{ fontSize: 13, color: "#aaa", margin: 0 }}>
                    No action plan available.
                  </p>
                )}
              </>
            )}

            {activeTab === "assumptions" && (
              <>
                {idea.assumptionsToTest?.length > 0 ? (
                  idea.assumptionsToTest.map((a, i) => (
                    <div
                      key={i}
                      style={{
                        marginBottom: 8,
                        padding: "8px 10px",
                        background: "#fafafa",
                        borderRadius: 6,
                        border: "1px solid #f0f0ee",
                      }}
                    >
                      <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 500, color: "#333" }}>
                        {a.assumption}
                      </p>
                      <p style={{ margin: "0 0 2px", fontSize: 12, color: "#777" }}>
                        <strong>How:</strong> {a.validationMethod}
                      </p>
                      <p style={{ margin: 0, fontSize: 12, color: "#777" }}>
                        <strong>Success:</strong> {a.successCriteria}
                      </p>
                    </div>
                  ))
                ) : (
                  <p style={{ fontSize: 13, color: "#aaa", margin: 0 }}>
                    No assumptions listed.
                  </p>
                )}
              </>
            )}

            {activeTab === "research" && (
              <>
                {(researchReasoningSteps?.length > 0 || isResearching) && (
                  <ThinkingBlock
                    steps={researchReasoningSteps ?? []}
                    isStreaming={isResearching && !researchReasoningSteps}
                    variant="research"
                  />
                )}
                <ResearchPanel
                  research={idea.research ?? null}
                  isResearching={isResearching}
                  error={researchError}
                  onRun={handleRunResearch}
                  lastFetched={formatTimestamp(idea.research?.fetchedAt)}
                />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ResearchPanel({ research, isResearching, error, onRun, lastFetched }) {
  const verdictConfig = {
    validates: { color: "#4caf50", bg: "#f4fbf4", border: "#a0c8a0", label: "✓ Validates idea" },
    challenges: { color: "#ef4444", bg: "#fff5f5", border: "#fca5a5", label: "✗ Challenges idea" },
    mixed:      { color: "#f59e0b", bg: "#fffbeb", border: "#fde68a", label: "~ Mixed signals"  },
  };

  if (isResearching) {
    return (
      <div style={{ textAlign: "center", padding: "32px 0" }}>
        <div style={{ fontSize: 24, marginBottom: 12, animation: "spin 2s linear infinite", display: "inline-block" }}>🔍</div>
        <p style={{ margin: 0, fontSize: 13, color: "#888", fontWeight: 500 }}>Researching the web…</p>
        <p style={{ margin: "6px 0 0", fontSize: 12, color: "#bbb" }}>This usually takes 10–20 seconds</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "12px 14px", background: "#fff5f5", border: "1px solid #fca5a5", borderRadius: 7 }}>
        <p style={{ margin: "0 0 10px", fontSize: 13, color: "#b91c1c" }}>⚠ {error}</p>
        <button onClick={onRun} style={{ fontSize: 12, fontWeight: 600, color: "white", background: "#1a1a1a", border: "none", borderRadius: 5, padding: "5px 12px", cursor: "pointer" }}>
          Try again
        </button>
      </div>
    );
  }

  if (!research) {
    return (
      <div style={{ textAlign: "center", padding: "28px 0" }}>
        <p style={{ fontSize: 28, margin: "0 0 10px" }}>🌐</p>
        <p style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 600, color: "#333" }}>No research yet</p>
        <p style={{ margin: "0 0 18px", fontSize: 12, color: "#aaa" }}>
          Search the web for competitors, market signals, and customer evidence for this idea.
        </p>
        <button
          onClick={onRun}
          style={{ padding: "8px 18px", fontSize: 13, fontWeight: 600, color: "white", background: "#1a1a1a", border: "none", borderRadius: 6, cursor: "pointer" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#333")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#1a1a1a")}
        >
          Run Research
        </button>
      </div>
    );
  }

  const vc = verdictConfig[research.verdict] ?? verdictConfig.mixed;

  return (
    <div>
      {/* Verdict badge */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
        <div style={{ padding: "8px 12px", background: vc.bg, border: `1px solid ${vc.border}`, borderRadius: 7, flex: 1 }}>
          <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 700, color: vc.color }}>{vc.label}</p>
          <p style={{ margin: 0, fontSize: 12, color: "#555", lineHeight: 1.5 }}>{research.verdictReasoning}</p>
        </div>
        <button
          onClick={onRun}
          title="Refresh research"
          style={{ flexShrink: 0, padding: "6px 10px", fontSize: 12, color: "#888", background: "#f5f5f5", border: "1px solid #e0e0de", borderRadius: 6, cursor: "pointer" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#ebebeb")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#f5f5f5")}
        >
          ↺
        </button>
      </div>

      {lastFetched && (
        <p style={{ margin: "-8px 0 14px", fontSize: 11, color: "#bbb" }}>Last researched {lastFetched}</p>
      )}

      {/* Competitors */}
      {research.competitors?.length > 0 && (
        <ResearchSection title="🏢 Competitors">
          {research.competitors.map((c, i) => (
            <div key={i} style={{ marginBottom: 8, paddingBottom: 8, borderBottom: i < research.competitors.length - 1 ? "1px solid #f5f5f5" : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a" }}>{c.name}</span>
                {c.url && (
                  <a href={c.url} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: 11, color: "#4a90d9", textDecoration: "none" }}>
                    ↗ Visit
                  </a>
                )}
              </div>
              <p style={{ margin: 0, fontSize: 12, color: "#666", lineHeight: 1.5 }}>{c.summary}</p>
            </div>
          ))}
        </ResearchSection>
      )}

      {/* Market signals */}
      {research.marketSignals?.length > 0 && (
        <ResearchSection title="📈 Market Signals">
          {research.marketSignals.map((s, i) => (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 7 }}>
              <span style={{ flexShrink: 0, fontSize: 14, paddingTop: 1 }}>•</span>
              <div>
                <span style={{ fontSize: 12, color: "#333", lineHeight: 1.5 }}>{s.insight}</span>
                {s.url && (
                  <a href={s.url} target="_blank" rel="noopener noreferrer"
                    style={{ display: "inline-block", marginLeft: 6, fontSize: 11, color: "#4a90d9", textDecoration: "none" }}>
                    [{s.source || "source"} ↗]
                  </a>
                )}
              </div>
            </div>
          ))}
        </ResearchSection>
      )}

      {/* Customer evidence */}
      {research.customerEvidence?.length > 0 && (
        <ResearchSection title="💬 Customer Evidence">
          {research.customerEvidence.map((e, i) => {
            const sentimentColor = e.sentiment === "positive" ? "#4caf50" : e.sentiment === "negative" ? "#ef4444" : "#f59e0b";
            return (
              <div key={i} style={{ marginBottom: 8, padding: "8px 10px", background: "#fafafa", borderRadius: 6, border: "1px solid #f0f0ee", borderLeft: `3px solid ${sentimentColor}` }}>
                <p style={{ margin: "0 0 4px", fontSize: 12, color: "#444", lineHeight: 1.5, fontStyle: "italic" }}>"{e.quote}"</p>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: sentimentColor, textTransform: "uppercase", letterSpacing: "0.05em" }}>{e.sentiment}</span>
                  {e.url ? (
                    <a href={e.url} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: 11, color: "#aaa", textDecoration: "none" }}>
                      — {e.source || "source"} ↗
                    </a>
                  ) : (
                    <span style={{ fontSize: 11, color: "#bbb" }}>— {e.source}</span>
                  )}
                </div>
              </div>
            );
          })}
        </ResearchSection>
      )}
    </div>
  );
}

function ResearchSection({ title, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.07em" }}>
        {title}
      </p>
      {children}
    </div>
  );
}

function ScoreChip({ label, score }) {
  if (score == null) return null;
  const color =
    score >= 7 ? "#4caf50" : score >= 4 ? "#ff9800" : "#f44336";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "2px 8px",
        borderRadius: 99,
        fontSize: 11,
        fontWeight: 600,
        background: `${color}18`,
        color: color,
        border: `1px solid ${color}40`,
      }}
    >
      {label} {score}/10
    </span>
  );
}

function EmptyState({ section, onGenerate }) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "60px 24px",
        color: "#aaa",
      }}
    >
      <p style={{ fontSize: 32, margin: "0 0 12px" }}>💡</p>
      <p
        style={{
          margin: "0 0 8px",
          fontSize: 15,
          fontWeight: 600,
          color: "#555",
        }}
      >
        No ideas yet
      </p>
      <p style={{ margin: "0 0 24px", fontSize: 13, color: "#aaa" }}>
        Generate AI ideas for {section.title.toLowerCase()} based on your
        business context.
      </p>
      <button
        onClick={onGenerate}
        style={{
          padding: "9px 20px",
          fontSize: 13,
          fontWeight: 600,
          color: "white",
          background: "#1a1a1a",
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#333")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "#1a1a1a")}
      >
        Generate Ideas
      </button>
    </div>
  );
}

function LoadingIdeas({ inline }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        padding: inline ? "16px 0" : "60px 24px",
        color: "#aaa",
        fontSize: 13,
      }}
    >
      <span
        style={{
          display: "inline-block",
          animation: "spin 1s linear infinite",
        }}
      >
        ↺
      </span>
      Generating ideas…
    </div>
  );
}
