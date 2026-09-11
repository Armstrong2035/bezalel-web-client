"use client";

import { canvasSections } from "@/app/segments/canvasSection";

const statusFor = (idea) =>
  idea.decisionStatus ?? (idea.accepted ? "now" : "explore");

const contextLabels = {
  idea: "Business idea",
  journey: "Business stage",
  goal: "Founder goal",
  timeAvailability: "Time available",
  capital: "Available capital",
  experienceLevel: "Experience level",
  background: "Relevant background",
  archetype: "Business type",
};

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

function groupedIdeas(ideas, status) {
  return canvasSections
    .map((section) => ({
      section,
      ideas: ideas
        .filter((idea) => idea.segment === section.key && statusFor(idea) === status)
        .sort((a, b) => (a.priority ?? Number.MAX_SAFE_INTEGER) - (b.priority ?? Number.MAX_SAFE_INTEGER)),
    }))
    .filter(({ ideas: sectionIdeas }) => sectionIdeas.length > 0);
}

function buildMarkdown(title, context, ideas) {
  const nowGroups = groupedIdeas(ideas, "now");
  const laterGroups = groupedIdeas(ideas, "later");
  const contextEntries = Object.entries(context ?? {}).filter(([, value]) => value);
  const lines = [`# ${title}`, "", `Exported ${new Date().toLocaleDateString()}`, ""];

  if (contextEntries.length > 0) {
    lines.push("## Business Context", "");
    contextEntries.forEach(([key, value]) => lines.push(`- **${contextLabels[key] ?? key}:** ${value}`));
    lines.push("");
  }

  lines.push("## Current Priorities", "");
  if (nowGroups.length === 0) {
    lines.push("No choices are marked Now yet.", "");
  } else {
    nowGroups.forEach(({ section, ideas: sectionIdeas }) => {
      lines.push(`### ${section.title}`, "");
      sectionIdeas.forEach((idea, index) => {
        lines.push(`${index + 1}. **${idea.title}**${idea.description ? ` — ${idea.description}` : ""}`);
        if (idea.assumptionsToTest?.length) {
          idea.assumptionsToTest.forEach((assumption) =>
            lines.push(`   - Test: ${assumption.assumption} (${assumption.validationMethod})`)
          );
        }
        if (idea.actionPlan) {
          ["week1", "week2", "week3", "week4"].forEach((week, weekIndex) => {
            if (idea.actionPlan[week]) lines.push(`   - Week ${weekIndex + 1}: ${idea.actionPlan[week]}`);
          });
        }
      });
      lines.push("");
    });
  }

  if (laterGroups.length > 0) {
    lines.push("## Planned for Later", "");
    laterGroups.forEach(({ section, ideas: sectionIdeas }) => {
      lines.push(`### ${section.title}`, "");
      sectionIdeas.forEach((idea) => lines.push(`- **${idea.title}**${idea.description ? ` — ${idea.description}` : ""}`));
      lines.push("");
    });
  }

  return lines.join("\n");
}

function buildPrintHtml(title, markdown) {
  const content = escapeHtml(markdown)
    .replace(/^# (.*)$/gm, "<h1>$1</h1>")
    .replace(/^## (.*)$/gm, "<h2>$1</h2>")
    .replace(/^### (.*)$/gm, "<h3>$1</h3>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br />");

  return `<!doctype html><html><head><title>${escapeHtml(title)}</title><style>
    body { font-family: Arial, sans-serif; color: #1a1a1a; max-width: 760px; margin: 48px auto; line-height: 1.55; }
    h1 { font-size: 30px; margin-bottom: 8px; } h2 { font-size: 20px; margin-top: 32px; border-bottom: 1px solid #ddd; padding-bottom: 6px; }
    h3 { font-size: 15px; margin: 20px 0 8px; } @media print { body { margin: 24px; } }
  </style></head><body>${content}</body></html>`;
}

export default function DocumentExport({ title, context, ideas, onClose }) {
  const markdown = buildMarkdown(title, context, ideas);

  const handleDownload = () => {
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "business-canvas"}-brief.md`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.opener = null;
    printWindow.document.write(buildPrintHtml(title, markdown));
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(0,0,0,0.18)" }} />
      <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 61, width: "min(460px, calc(100vw - 32px))", background: "white", borderRadius: 10, boxShadow: "0 16px 48px rgba(0,0,0,0.2)", padding: 24 }}>
        <h2 style={{ margin: "0 0 8px", fontSize: 18 }}>Export business brief</h2>
        <p style={{ margin: "0 0 20px", fontSize: 13, color: "#666", lineHeight: 1.5 }}>
          Includes your business context, active decisions in priority order, assumptions to test, and later plans.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button onClick={handlePrint} style={primaryButton}>Print / Save as PDF</button>
          <button onClick={handleDownload} style={secondaryButton}>Download Markdown</button>
          <button onClick={onClose} style={secondaryButton}>Cancel</button>
        </div>
      </div>
    </>
  );
}

const primaryButton = { padding: "9px 14px", border: "none", borderRadius: 6, background: "#1a1a1a", color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer" };
const secondaryButton = { padding: "9px 14px", border: "1px solid #ddd", borderRadius: 6, background: "white", color: "#444", fontSize: 13, fontWeight: 600, cursor: "pointer" };
