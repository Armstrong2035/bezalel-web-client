/**
 * canvasReasoning.js
 *
 * Builds a structured chain-of-reasoning string from the current document
 * snapshot. This is injected as hidden context into both the chat system
 * prompt and the research prompt — the AI reasons across the full canvas
 * before forming any response.
 *
 * Used by:
 *   - src/app/api/chat/route.js
 *   - src/app/lib/services/researchService.js
 *
 * Input: documentSnapshot — shape expected:
 * {
 *   title: string,
 *   context: { idea, archetype, goal, experienceLevel, ... },
 *   ideas: object  — flat map of ideaId → ideaDoc (from canvasSegments)
 * }
 */

// Canonical section definitions (no MUI imports — this runs server-side)
const SECTIONS = [
  { key: "customerSegments",     title: "Customer Segments",      question: "For whom are we creating value?" },
  { key: "valueProposition",     title: "Value Propositions",     question: "What value do we deliver to the customer?" },
  { key: "channels",             title: "Channels",               question: "Through which channels do we reach customers?" },
  { key: "customerRelationships",title: "Customer Relationships", question: "What relationship does each segment expect?" },
  { key: "revenueStreams",       title: "Revenue Streams",        question: "For what value will customers pay?" },
  { key: "keyResources",         title: "Key Resources",          question: "What resources does the value proposition require?" },
  { key: "keyActivities",        title: "Key Activities",         question: "What activities does the value proposition require?" },
  { key: "keyPartners",          title: "Key Partners",           question: "Who are key partners and suppliers?" },
  { key: "costStructure",        title: "Cost Structure",         question: "What are the most important costs?" },
];

// Logical dependency pairs — sections that must be consistent with each other
const DEPENDENCY_PAIRS = [
  ["customerSegments",      "valueProposition",      "The value proposition must directly solve a problem the customer segment has."],
  ["customerSegments",      "channels",              "Channels must map to how the customer segment actually discovers and buys."],
  ["customerSegments",      "customerRelationships", "The relationship model must match what the customer segment expects."],
  ["valueProposition",      "revenueStreams",         "Customers will only pay for a value proposition they genuinely care about."],
  ["valueProposition",      "keyResources",           "Key resources must be sufficient to deliver the value proposition."],
  ["valueProposition",      "keyActivities",          "Key activities must be the ones that actually produce the value proposition."],
  ["revenueStreams",         "costStructure",          "Revenue model must be viable against the cost structure — margins must work."],
  ["keyActivities",         "keyResources",           "Activities require resources — they must be aligned."],
  ["keyPartners",           "keyActivities",          "Partners should fill gaps in activities the business cannot do alone."],
  ["keyPartners",           "keyResources",           "Partners should provide resources the business lacks."],
  ["channels",              "revenueStreams",          "The channel model affects the revenue model — direct vs indirect changes margins."],
];

/**
 * Extracts the accepted idea for a section key, or the most recent one if
 * none is explicitly accepted. Returns null if no ideas exist for that section.
 *
 * @param {string} sectionKey
 * @param {object} ideas — flat map of ideaId → ideaDoc
 * @returns {object|null}
 */
function getActiveIdea(sectionKey, ideas) {
  if (!ideas || typeof ideas !== "object") return null;
  const sectionIdeas = Object.values(ideas).filter(
    (i) => i.segment === sectionKey
  );
  if (sectionIdeas.length === 0) return null;
  return (
    sectionIdeas.find((i) => i.accepted) ??
    sectionIdeas.sort(
      (a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0)
    )[0]
  );
}

/**
 * Formats one section's state as a readable line for the reasoning chain.
 */
function formatSectionState(section, idea) {
  if (!idea) {
    return `  ${section.title}: [NOT SET]`;
  }
  const accepted = idea.accepted ? " ✓ accepted" : " (not yet accepted)";
  const research = idea.research
    ? ` | Research verdict: ${idea.research.verdict}`
    : "";
  return `  ${section.title}${accepted}: "${idea.title}" — ${idea.description}${research}`;
}

/**
 * Checks a dependency pair and returns a finding string if there's a
 * potential inconsistency or gap worth flagging.
 */
function checkDependency(pairDef, ideas) {
  const [keyA, keyB, rule] = pairDef;
  const ideaA = getActiveIdea(keyA, ideas);
  const ideaB = getActiveIdea(keyB, ideas);

  if (!ideaA && !ideaB) return null; // both empty — nothing to check
  if (!ideaA) return `  ⚠ ${SECTIONS.find(s => s.key === keyA)?.title} is not set — cannot verify: ${rule}`;
  if (!ideaB) return `  ⚠ ${SECTIONS.find(s => s.key === keyB)?.title} is not set — cannot verify: ${rule}`;

  return `  • ${SECTIONS.find(s => s.key === keyA)?.title} ↔ ${SECTIONS.find(s => s.key === keyB)?.title}: ${rule}`;
}

/**
 * Main export — builds the full reasoning chain as a string.
 *
 * @param {{ title: string, context: object, ideas: object }} documentSnapshot
 * @returns {string} The reasoning chain, ready to embed in a prompt
 */
export function buildCanvasReasoning(documentSnapshot) {
  const { title = "Untitled", context = {}, ideas = {} } = documentSnapshot;

  const lines = [];

  // ── STEP 1: Canvas completeness ──────────────────────────────────
  lines.push("=== CANVAS REASONING CHAIN ===");
  lines.push("");
  lines.push("STEP 1 — CANVAS STATE");
  lines.push(`Document: "${title}"`);
  if (context.idea) lines.push(`Founder's idea: ${context.idea}`);
  if (context.archetype) lines.push(`Business type: ${context.archetype}`);
  if (context.goal) lines.push(`Goal: ${context.goal}`);
  lines.push("");

  const setSections = [];
  const emptySections = [];

  SECTIONS.forEach((section) => {
    const idea = getActiveIdea(section.key, ideas);
    lines.push(formatSectionState(section, idea));
    if (idea) setSections.push(section.title);
    else emptySections.push(section.title);
  });

  lines.push("");
  lines.push(`Sections with ideas: ${setSections.length}/9`);
  if (emptySections.length > 0) {
    lines.push(`Missing sections: ${emptySections.join(", ")}`);
  }

  // ── STEP 2: Logical dependency check ─────────────────────────────
  lines.push("");
  lines.push("STEP 2 — LOGICAL DEPENDENCIES");
  lines.push("Each dependency rule must hold for the canvas to be internally consistent:");
  lines.push("");

  DEPENDENCY_PAIRS.forEach((pair) => {
    const finding = checkDependency(pair, ideas);
    if (finding) lines.push(finding);
  });

  // ── STEP 3: Contradiction detection ──────────────────────────────
  lines.push("");
  lines.push("STEP 3 — CONTRADICTION SCAN");
  lines.push("Flag any direct conflicts you can detect between accepted ideas.");
  lines.push("Examples of contradictions to look for:");
  lines.push("  - Premium pricing vs mass-market customer segment");
  lines.push("  - High-touch relationship model vs no key activities for account management");
  lines.push("  - Digital-only channel vs customer segment that prefers in-person");
  lines.push("  - High fixed cost structure vs usage-based revenue model with uncertain volume");
  lines.push("  - Dependence on a key partner who is also a potential competitor");
  lines.push("You must identify real contradictions based on the actual accepted ideas above, not hypothetical ones.");

  // ── STEP 4: Supporting evidence ───────────────────────────────────
  lines.push("");
  lines.push("STEP 4 — REINFORCING PAIRS");
  lines.push("Identify where sections genuinely support and strengthen each other.");
  lines.push("Note the strongest link in this canvas and the weakest/most fragile one.");

  // ── STEP 5: Research alignment ────────────────────────────────────
  const sectionsWithResearch = SECTIONS.filter((s) => {
    const idea = getActiveIdea(s.key, ideas);
    return idea?.research != null;
  });

  if (sectionsWithResearch.length > 0) {
    lines.push("");
    lines.push("STEP 5 — RESEARCH ALIGNMENT");
    lines.push("The following sections have live research data attached:");
    sectionsWithResearch.forEach((s) => {
      const idea = getActiveIdea(s.key, ideas);
      const r = idea.research;
      lines.push(`  ${s.title} (${r.verdict}): ${r.verdictReasoning}`);
      if (r.competitors?.length > 0) {
        lines.push(`    Competitors found: ${r.competitors.map((c) => c.name).join(", ")}`);
      }
    });
    lines.push("Cross-reference: does the research evidence support or challenge the internal consistency findings above?");
    lines.push("Are there competitors that exploit the contradictions in this canvas?");
  }

  lines.push("");
  lines.push("=== END REASONING CHAIN ===");
  lines.push("");
  lines.push("Use the above analysis to inform your response. Do not repeat this analysis back verbatim — synthesise it into your answer.");

  return lines.join("\n");
}

/**
 * Serialises the document snapshot into a compact canvas summary string.
 * Used as part of the chat system prompt — shorter than the full reasoning chain.
 *
 * @param {{ title: string, context: object, ideas: object }} documentSnapshot
 * @returns {string}
 */
export function buildCanvasSummary(documentSnapshot) {
  const { title = "Untitled", context = {}, ideas = {} } = documentSnapshot;

  const lines = [
    `Document: "${title}"`,
    context.idea ? `Business idea: ${context.idea}` : null,
    context.archetype ? `Type: ${context.archetype}` : null,
    context.goal ? `Founder goal: ${context.goal}` : null,
    context.experienceLevel ? `Experience: ${context.experienceLevel}` : null,
    "",
    "CANVAS (accepted or latest idea per section):",
  ].filter((l) => l !== null);

  SECTIONS.forEach((section) => {
    const idea = getActiveIdea(section.key, ideas);
    if (idea) {
      lines.push(`  ${section.title}: ${idea.title} — ${idea.description}`);
    } else {
      lines.push(`  ${section.title}: [not set]`);
    }
  });

  return lines.join("\n");
}
