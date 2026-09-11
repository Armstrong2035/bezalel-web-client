"use client";

/**
 * DocumentSection
 * Renders a single canvas section as a Notion-style block:
 *   - H2 heading with the section title + icon
 *   - Subtitle description
 *   - Top-voted idea body text (or an empty state prompt)
 *   - Clicking the body area opens the right panel
 */
export default function DocumentSection({ section, topIdea, nowIdeas = [], onOpenPanel, isActive }) {
  const Icon = section.icon;
  const hasIdea = !!topIdea;
  const displayedIdeas = nowIdeas.length > 0 ? nowIdeas : topIdea ? [topIdea] : [];

  return (
    <section
      id={section.key}
      style={{
        padding: "40px 0 48px",
        borderBottom: "1px solid #e8e8e6",
        scrollMarginTop: 24,
      }}
    >
      {/* Section heading row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 6,
        }}
      >
        <Icon
          style={{
            fontSize: 20,
            color: "#888",
            flexShrink: 0,
          }}
        />
        <h2
          style={{
            margin: 0,
            fontSize: 22,
            fontWeight: 700,
            color: "#1a1a1a",
            letterSpacing: "-0.4px",
            lineHeight: 1.2,
          }}
        >
          {section.title}
        </h2>
        <span
          style={{
            marginLeft: 4,
            fontSize: 12,
            color: "#aaa",
            fontWeight: 400,
          }}
        >
          {section.order} of 9
        </span>
      </div>

      {/* Description */}
      <p
        style={{
          margin: "0 0 20px",
          fontSize: 13,
          color: "#888",
          fontStyle: "italic",
          lineHeight: 1.5,
        }}
      >
        {section.description}
      </p>

      {/* Selected idea body — click to open panel */}
      <button
        onClick={() => onOpenPanel(section.key)}
        style={{
          display: "block",
          width: "100%",
          textAlign: "left",
          background: isActive ? "#f0f0fd" : "transparent",
          border: "1px solid",
          borderColor: isActive ? "#c4c4f0" : "transparent",
          borderRadius: 6,
          padding: "14px 16px",
          cursor: "pointer",
          transition: "background 0.15s, border-color 0.15s",
        }}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.currentTarget.style.background = "#f7f7f5";
            e.currentTarget.style.borderColor = "#e0e0de";
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.borderColor = "transparent";
          }
        }}
      >
        {hasIdea ? (
          <div>
            {nowIdeas.length > 0 && (
              <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 700, color: "#287c2f", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Now — in priority order
              </p>
            )}
            {displayedIdeas.map((idea, index) => (
              <div key={idea.id} style={{ marginBottom: index < displayedIdeas.length - 1 ? 12 : 0 }}>
                <p style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 600, color: "#1a1a1a", lineHeight: 1.4 }}>
                  {nowIdeas.length > 0 ? `${index + 1}. ` : ""}{idea.title}
                </p>
                <p style={{ margin: 0, fontSize: 14, color: "#555", lineHeight: 1.6 }}>
                  {idea.description}
                </p>
              </div>
            ))}
            <span
              style={{
                display: "inline-block",
                marginTop: 10,
                fontSize: 12,
                color: "#aaa",
              }}
            >
              Click to view all options →
            </span>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: "#bbb",
            }}
          >
            <span style={{ fontSize: 18 }}>+</span>
            <span style={{ fontSize: 14 }}>
              Generate ideas for {section.title.toLowerCase()}…
            </span>
          </div>
        )}
      </button>
    </section>
  );
}
