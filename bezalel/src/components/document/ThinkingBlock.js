"use client";

import { useState } from "react";

/**
 * ThinkingBlock
 *
 * ChatGPT-style collapsible reasoning block shown above an assistant message.
 * Collapsed state shows a summary line; expanded shows all parsed steps.
 *
 * Props:
 *   steps       — Array<{ title: string, body: string }> from the API preamble
 *   isStreaming  — if true, shows an animated "Analysing canvas…" state
 *   variant      — "chat" (default) | "research" — slight style difference
 */
export default function ThinkingBlock({ steps = [], isStreaming = false, variant = "chat" }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const isResearch = variant === "research";
  const accentColor = isResearch ? "#4a90d9" : "#7c6af7";
  const bgColor = isResearch ? "#f0f6ff" : "#f5f3ff";
  const borderColor = isResearch ? "#bfdbfe" : "#ddd6fe";
  const labelText = isResearch ? "How we researched this" : "Canvas analysis";
  const icon = isResearch ? "🔍" : "🧠";

  if (isStreaming) {
    return (
      <div style={containerStyle(bgColor, borderColor)}>
        <div style={headerStyle}>
          <span style={{ fontSize: 13, display: "inline-block", animation: "spin 2s linear infinite" }}>
            {icon}
          </span>
          <span style={{ fontSize: 12, color: "#888", fontStyle: "italic" }}>
            Analysing your canvas…
          </span>
        </div>
      </div>
    );
  }

  if (!steps?.length) return null;

  // Collapsed summary: count steps and note key findings
  const stepCount = steps.length;
  const hasWarnings = steps.some((s) => s.body?.includes("⚠"));
  const hasBullets = steps.some((s) => s.body?.includes("•"));

  return (
    <div style={containerStyle(bgColor, borderColor)}>
      {/* Header — always visible, clickable */}
      <button
        onClick={() => setIsExpanded((v) => !v)}
        style={{
          ...headerStyle,
          background: "none",
          border: "none",
          cursor: "pointer",
          width: "100%",
          textAlign: "left",
          padding: 0,
          fontFamily: "inherit",
        }}
      >
        <span style={{ fontSize: 13 }}>{icon}</span>
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: accentColor,
            flex: 1,
          }}
        >
          {labelText}
          {hasWarnings && (
            <span
              style={{
                marginLeft: 8,
                fontSize: 10,
                fontWeight: 700,
                background: "#fef3c7",
                color: "#92400e",
                padding: "1px 6px",
                borderRadius: 99,
                border: "1px solid #fde68a",
              }}
            >
              issues found
            </span>
          )}
        </span>
        <span
          style={{
            fontSize: 11,
            color: "#aaa",
            transition: "transform 0.2s",
            transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
            display: "inline-block",
          }}
        >
          ▾
        </span>
      </button>

      {/* Collapsed summary line */}
      {!isExpanded && (
        <p style={{ margin: "4px 0 0", fontSize: 11, color: "#999" }}>
          {stepCount} step{stepCount !== 1 ? "s" : ""} ·{" "}
          {hasWarnings ? "gaps & contradictions flagged" : hasBullets ? "dependencies mapped" : "canvas reviewed"}
          {" "}· click to expand
        </p>
      )}

      {/* Expanded steps */}
      {isExpanded && (
        <div style={{ marginTop: 10 }}>
          {steps.map((step, i) => (
            <StepBlock key={i} step={step} accentColor={accentColor} isLast={i === steps.length - 1} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function StepBlock({ step, accentColor, isLast }) {
  const [open, setOpen] = useState(false);
  const lines = step.body?.split("\n").filter((l) => l.trim()) ?? [];

  return (
    <div
      style={{
        borderLeft: `2px solid ${open ? accentColor : "#e0e0de"}`,
        paddingLeft: 10,
        marginBottom: isLast ? 0 : 12,
        transition: "border-color 0.15s",
      }}
    >
      {/* Step title — clickable to toggle body */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
          fontFamily: "inherit",
          width: "100%",
          textAlign: "left",
        }}
      >
        <span
          style={{
            fontSize: 10,
            color: open ? accentColor : "#ccc",
            transition: "color 0.15s",
            transform: open ? "rotate(90deg)" : "rotate(0deg)",
            display: "inline-block",
            transition: "transform 0.15s, color 0.15s",
          }}
        >
          ▶
        </span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "#555",
            fontFamily: "monospace",
            letterSpacing: "0.02em",
          }}
        >
          {step.title}
        </span>
      </button>

      {/* Step body lines */}
      {open && lines.length > 0 && (
        <div style={{ marginTop: 6 }}>
          {lines.map((line, i) => (
            <ReasoningLine key={i} line={line} accentColor={accentColor} />
          ))}
        </div>
      )}
    </div>
  );
}

function ReasoningLine({ line, accentColor }) {
  const isWarning = line.trimStart().startsWith("⚠");
  const isBullet = line.trimStart().startsWith("•");
  const isSection = line.trimStart().startsWith("===");
  const isHeader = /^[A-Z\s]+:/.test(line.trim()) && line.trim().length < 60;

  if (isSection) return null; // skip delimiter lines

  const indent = line.match(/^(\s+)/)?.[1]?.length ?? 0;

  return (
    <div
      style={{
        display: "flex",
        gap: 6,
        padding: "2px 0",
        paddingLeft: Math.min(indent * 2, 16),
        alignItems: "flex-start",
      }}
    >
      {isWarning && (
        <span style={{ flexShrink: 0, fontSize: 11, color: "#f59e0b", paddingTop: 1 }}>⚠</span>
      )}
      <span
        style={{
          fontSize: 11,
          fontFamily: isBullet || isWarning || isHeader ? "inherit" : "monospace",
          color: isWarning
            ? "#92400e"
            : isHeader
            ? "#555"
            : isBullet
            ? "#444"
            : "#666",
          fontWeight: isHeader ? 600 : 400,
          lineHeight: 1.55,
          wordBreak: "break-word",
        }}
      >
        {isWarning ? line.replace(/^\s*⚠\s*/, "").trim() : line.trim()}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Shared styles                                                         */
/* ------------------------------------------------------------------ */

function containerStyle(bg, border) {
  return {
    background: bg,
    border: `1px solid ${border}`,
    borderRadius: 8,
    padding: "10px 12px",
    marginBottom: 6,
  };
}

const headerStyle = {
  display: "flex",
  alignItems: "center",
  gap: 8,
};
