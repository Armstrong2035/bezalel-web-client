"use client";

import { MESSAGE_TYPE_META } from "@/stores/inboxMetadata";

const CARD_W = 244;
const CARD_H = 116;

/**
 * Full-shell overlay that draws an animated arrow from the selected message row
 * (in the message list) and branches it into the two available tools.
 *
 * Rendered only while the user chooses where to route a message. Clicking a
 * tool card routes the message into that tool; clicking the backdrop cancels.
 */
export default function ToolBranch({ message, sourceRect, targetRect, onChoose, onClose }) {
  const vw = typeof window !== "undefined" ? window.innerWidth : 0;
  const vh = typeof window !== "undefined" ? window.innerHeight : 0;

  const meta = MESSAGE_TYPE_META[message?.type] ?? MESSAGE_TYPE_META.activity;

  const sx = sourceRect ? sourceRect.right : (targetRect?.left ?? vw * 0.4) - 24;
  const sy = sourceRect
    ? sourceRect.top + sourceRect.height / 2
    : (targetRect?.top ?? 0) + (targetRect?.height ?? vh) / 2;

  const left = targetRect?.left ?? vw * 0.5;
  const width = targetRect?.width ?? vw * 0.5;
  const top = targetRect?.top ?? 0;
  const height = targetRect?.height ?? vh;

  const cx = left + Math.min(CARD_W / 2 + 36, width * 0.36);
  const cy1 = top + height * 0.36;
  const cy2 = top + height * 0.66;

  const cards = [
    {
      tool: "canvas",
      icon: "🧭",
      label: "Business Model",
      desc: "Refine context, canvas sections, and decisions.",
      y: cy1,
    },
    {
      tool: "outreach",
      icon: "📣",
      label: "Outreach",
      desc: "Find and reach prospects that match your ICP.",
      y: cy2,
    },
  ];

  const bezierTo = (ty) => {
    const tx = cx - CARD_W / 2;
    const dx = Math.max(48, (tx - sx) * 0.55);
    return `M ${sx} ${sy} C ${sx + dx} ${sy}, ${tx - dx} ${ty}, ${tx} ${ty}`;
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 120, fontFamily: "inherit" }}>
      {/* Backdrop — clicking it cancels the route */}
      <div
        onClick={onClose}
        style={{ position: "absolute", inset: 0, background: "rgba(20,20,20,0.10)" }}
      />

      {/* Source highlight on the message row */}
      {sourceRect && (
        <div
          style={{
            position: "absolute",
            left: sourceRect.left - 3,
            top: sourceRect.top - 3,
            width: sourceRect.width + 6,
            height: sourceRect.height + 6,
            border: `2px solid ${meta.color}`,
            borderRadius: 8,
            pointerEvents: "none",
            boxShadow: `0 0 0 4px ${meta.color}22`,
            animation: "bezelal-pulse 1.1s ease-in-out infinite",
          }}
        />
      )}

      {/* Animated branch arrow */}
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${vw} ${vh}`}
        style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "visible" }}
      >
        <defs>
          <style>{`
            @keyframes bezalel-draw { to { stroke-dashoffset: 0; } }
            @keyframes bezalel-fade { from { opacity: 0; } to { opacity: 1; } }
            @keyframes bezalel-pulse { 0%,100% { box-shadow: 0 0 0 4px ${meta.color}22; } 50% { box-shadow: 0 0 0 8px ${meta.color}33; } }
          `}</style>
        </defs>
        {cards.map((card, index) => {
          const ty = card.y;
          const tx = cx - CARD_W / 2;
          return (
            <g key={card.tool}>
              <path
                d={bezierTo(ty)}
                fill="none"
                stroke={meta.color}
                strokeWidth={2.5}
                strokeLinecap="round"
                pathLength={1}
                style={{
                  strokeDasharray: 1,
                  strokeDashoffset: 1,
                  animation: `bezelal-draw 0.5s ${index * 0.12}s ease forwards`,
                }}
              />
              <circle
                cx={tx}
                cy={ty}
                r={5}
                fill={meta.color}
                style={{ opacity: 0, animation: `bezelal-fade 0.2s ${0.5 + index * 0.12}s forwards` }}
              />
            </g>
          );
        })}
      </svg>

      {/* Tool cards */}
      {cards.map((card, index) => (
        <button
          key={card.tool}
          onClick={() => onChoose(card.tool)}
          style={{
            position: "absolute",
            left: cx,
            top: card.y,
            width: CARD_W,
            minHeight: CARD_H,
            transform: "translate(-50%, -50%)",
            display: "grid",
            gap: 6,
            alignContent: "start",
            textAlign: "left",
            padding: "16px 18px",
            background: "#ffffff",
            border: "1px solid #e2e2dd",
            borderRadius: 12,
            boxShadow: "0 12px 32px rgba(0,0,0,0.14)",
            cursor: "pointer",
            color: "#20201f",
            font: "inherit",
            opacity: 0,
            animation: `bezalel-fade 0.25s ${0.35 + index * 0.12}s forwards`,
          }}
        >
          <span style={{ fontSize: 22, lineHeight: 1 }}>{card.icon}</span>
          <strong style={{ fontSize: 15, letterSpacing: "-0.02em" }}>{card.label}</strong>
          <span style={{ fontSize: 12.5, color: "#6b6b65", lineHeight: 1.5 }}>{card.desc}</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: meta.color, marginTop: 2 }}>
            Open in {card.label} →
          </span>
        </button>
      ))}

      {/* Cancel */}
      <button
        onClick={onClose}
        aria-label="Cancel"
        style={{
          position: "absolute",
          top: 18,
          right: 18,
          width: 34,
          height: 34,
          borderRadius: "50%",
          border: "1px solid #e0e0dc",
          background: "#ffffff",
          cursor: "pointer",
          fontSize: 16,
          color: "#666",
          lineHeight: 1,
        }}
      >
        ✕
      </button>
    </div>
  );
}
