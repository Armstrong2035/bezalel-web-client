"use client";

import { useState } from "react";
import { useAuth } from "@/app/hooks/useAuth";
import { useDocumentStore } from "@/stores/documentStore";
import onboardingQuestions from "@/components/onboarding/helpers/onboardingData";

const EMPTY_CONTEXT = {
  idea: "",
  journey: "",
  goal: "",
  timeAvailability: "",
  capital: "",
  experienceLevel: "",
  background: "",
  archetype: "",
};

/**
 * DocumentContext
 *
 * Right-side panel for editing the per-document business context.
 * Same 8 questions as onboarding, but scoped to one document.
 * Saving writes to /api/documents/[docId]/context and updates the store.
 *
 * Props:
 *   docId        — active document id
 *   initialContext — current context object (may be null/empty)
 *   onClose      — closes the panel
 *   onSaved      — called with the saved context after a successful PUT
 *   isRequired   — if true, shows a "required before generating" banner
 */
export default function DocumentContext({
  docId,
  initialContext,
  onClose,
  onSaved,
  isRequired = false,
}) {
  const { user } = useAuth();
  const setDocumentContext = useDocumentStore((s) => s.setDocumentContext);

  const [draft, setDraft] = useState({ ...EMPTY_CONTEXT, ...initialContext });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  const hasRequiredField = !!draft.idea?.trim();

  const handleChange = (id, value) => {
    setDraft((prev) => ({ ...prev, [id]: value }));
    setSaved(false);
    setError(null);
  };

  const handleSave = async () => {
    if (!user?.uid || !docId) return;
    if (!draft.idea?.trim()) {
      setError("Please describe your business idea before saving.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/documents/${docId}/context`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.uid, context: draft }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? "Failed to save context");
      }

      // Optimistic update in store
      setDocumentContext(docId, draft);
      setSaved(true);
      onSaved?.(draft);

      // Auto-close after a beat if not required (already had context)
      if (!isRequired) {
        setTimeout(() => onClose(), 800);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={isRequired ? undefined : onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 40,
          background: isRequired ? "rgba(0,0,0,0.15)" : "transparent",
          cursor: isRequired ? "default" : "pointer",
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
          minWidth: 400,
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
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            padding: "20px 24px 16px",
            borderBottom: "1px solid #e8e8e6",
            flexShrink: 0,
          }}
        >
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
              Document Context
            </h3>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "#999" }}>
              This context powers all AI generation for this document.
            </p>
          </div>

          {/* Only show close when not required */}
          {!isRequired && (
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
                flexShrink: 0,
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
          )}
        </div>

        {/* Required banner */}
        {isRequired && (
          <div
            style={{
              padding: "12px 24px",
              background: "#fffbeb",
              borderBottom: "1px solid #fde68a",
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: 16 }}>⚠️</span>
            <p style={{ margin: 0, fontSize: 13, color: "#92400e" }}>
              <strong>Context required.</strong> Add your business idea to
              unlock AI generation for this document.
            </p>
          </div>
        )}

        {/* Form body */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "20px 24px 32px",
          }}
        >
          {onboardingQuestions.map((q) => (
            <div key={q.id} style={{ marginBottom: 28 }}>
              {/* Label */}
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#1a1a1a",
                  marginBottom: 3,
                }}
              >
                <span>{q.emoji}</span>
                {q.question}
                {q.id === "idea" && (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#ef4444",
                      background: "#fee2e2",
                      padding: "1px 6px",
                      borderRadius: 99,
                    }}
                  >
                    required
                  </span>
                )}
              </label>

              {/* Hint */}
              <p
                style={{
                  margin: "0 0 8px",
                  fontSize: 12,
                  color: "#aaa",
                  lineHeight: 1.5,
                }}
              >
                {q.explanation}
              </p>

              {/* Input */}
              {q.type === "text-input" ? (
                <textarea
                  value={draft[q.id] || ""}
                  onChange={(e) => handleChange(q.id, e.target.value)}
                  placeholder={q.placeholder}
                  rows={4}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    fontSize: 13,
                    lineHeight: 1.6,
                    border: `1px solid ${
                      q.id === "idea" && !draft.idea?.trim()
                        ? "#fca5a5"
                        : "#e0e0de"
                    }`,
                    borderRadius: 7,
                    resize: "vertical",
                    outline: "none",
                    fontFamily: "inherit",
                    color: "#1a1a1a",
                    boxSizing: "border-box",
                    transition: "border-color 0.15s",
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = "#a0a0f0")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor =
                      q.id === "idea" && !draft.idea?.trim()
                        ? "#fca5a5"
                        : "#e0e0de")
                  }
                />
              ) : (
                <div
                  style={{ display: "flex", flexWrap: "wrap", gap: 6 }}
                >
                  {q.options.map((opt) => {
                    const isSelected = draft[q.id] === opt;
                    return (
                      <button
                        key={opt}
                        onClick={() => handleChange(q.id, opt)}
                        style={{
                          padding: "6px 12px",
                          fontSize: 12,
                          border: "1px solid",
                          borderRadius: 6,
                          cursor: "pointer",
                          fontFamily: "inherit",
                          lineHeight: 1.4,
                          transition: "all 0.12s",
                          background: isSelected ? "#1a1a1a" : "white",
                          color: isSelected ? "white" : "#444",
                          borderColor: isSelected ? "#1a1a1a" : "#e0e0de",
                        }}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer — save bar */}
        <div
          style={{
            borderTop: "1px solid #e8e8e6",
            padding: "16px 24px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexShrink: 0,
            background: "#fafafa",
          }}
        >
          <button
            onClick={handleSave}
            disabled={saving || !hasRequiredField}
            style={{
              padding: "9px 20px",
              fontSize: 13,
              fontWeight: 600,
              color: "white",
              background: saved
                ? "#4caf50"
                : saving || !hasRequiredField
                ? "#ccc"
                : "#1a1a1a",
              border: "none",
              borderRadius: 7,
              cursor:
                saving || !hasRequiredField ? "not-allowed" : "pointer",
              transition: "background 0.15s",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {saving ? (
              <>
                <span
                  style={{
                    display: "inline-block",
                    animation: "spin 1s linear infinite",
                  }}
                >
                  ↺
                </span>
                Saving…
              </>
            ) : saved ? (
              "✓ Saved"
            ) : (
              "Save Context"
            )}
          </button>

          {!isRequired && (
            <button
              onClick={onClose}
              style={{
                padding: "9px 16px",
                fontSize: 13,
                fontWeight: 500,
                color: "#666",
                background: "transparent",
                border: "1px solid #e0e0de",
                borderRadius: 7,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          )}

          {error && (
            <p
              style={{
                margin: 0,
                fontSize: 12,
                color: "#ef4444",
                flex: 1,
              }}
            >
              {error}
            </p>
          )}
        </div>
      </div>
    </>
  );
}
