import { getDocument, getDocumentCanvasIdeas } from "./documentService";
import { listActivities } from "./activityService";
import { getAutomation } from "./automationService";
import { getDigestSettings } from "./digestService";

export async function loadChatContext(userId, documentId) {
  const document = await getDocument(userId, documentId);
  if (!document) return null;
  // The saved canvas is required. Optional feature failures must remain distinct
  // from empty data, so the assistant cannot describe a failed read as an empty inbox.
  const [ideas, activities, automation, digest] = await Promise.allSettled([
    getDocumentCanvasIdeas(userId, documentId),
    listActivities(userId),
    getAutomation(userId, documentId),
    getDigestSettings(userId),
  ]);
  if (ideas.status === "rejected") throw ideas.reason;
  const optional = (result, project) => result.status === "fulfilled"
    ? { status: "available", data: project(result.value) }
    : { status: "unavailable" };
  return {
    snapshot: { title: document.title, context: document.context ?? {}, ideas: ideas.value },
    memory: document.chatMemory ?? null,
    features: {
      documentId,
      opportunityForm: document.opportunityForm ?? null,
      recentDocumentActivity: optional(activities, values => values
        .filter(value => value.documentId === documentId).slice(0, 12)
        .map(({ type, subject, preview, status, requiresAction, createdAt }) => ({
          type, subject, preview, status, requiresAction, createdAt,
        }))),
      automation: optional(automation, value => value ? { enabled: value.enabled, lastRunAt: value.lastRunAt } : null),
      digest: optional(digest, value => ({ paused: value.paused })),
    },
  };
}
