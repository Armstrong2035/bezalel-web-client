export const CANVAS_SECTION_LABELS = {
  customerSegments: "Customer Segments", valueProposition: "Value Propositions", channels: "Channels",
  customerRelationships: "Customer Relationships", revenueStreams: "Revenue Streams", keyResources: "Key Resources",
  keyActivities: "Key Activities", keyPartners: "Key Partners", costStructure: "Cost Structure",
};
export const CANVAS_EDIT_FIELDS = { title: "Title", description: "Description" };

export function validateCanvasEdits(edits, requireOriginal = false) {
  if (!Array.isArray(edits) || edits.length > 20) throw new Error("Provide up to 20 canvas edits.");
  const ids = new Set();
  return edits.map(edit => {
    if (!edit || typeof edit.ideaId !== "string" || !edit.ideaId || edit.ideaId.includes("/") || ids.has(edit.ideaId)) throw new Error("Each edit must target a distinct canvas idea.");
    ids.add(edit.ideaId);
    if (!Object.hasOwn(CANVAS_SECTION_LABELS, edit.segment)) throw new Error("Unknown canvas section.");
    if (!edit.changes || typeof edit.changes !== "object" || Array.isArray(edit.changes) || !Object.keys(edit.changes).length) throw new Error("Each edit needs a title or description change.");
    const changes = {}, originalValues = {};
    for (const [key, value] of Object.entries(edit.changes)) {
      if (!Object.hasOwn(CANVAS_EDIT_FIELDS, key) || typeof value !== "string" || !value.trim() || value.length > (key === "title" ? 240 : 8000)) throw new Error("Canvas edits need non-empty titles (up to 240 characters) or descriptions (up to 8,000 characters).");
      changes[key] = value.trim();
      if (requireOriginal) {
        if (typeof edit.originalValues?.[key] !== "string") throw new Error("Original values are required. Generate a fresh proposal.");
        originalValues[key] = edit.originalValues[key];
      }
    }
    return { ideaId: edit.ideaId, segment: edit.segment, changes, ...(requireOriginal ? { originalValues } : {}) };
  });
}
