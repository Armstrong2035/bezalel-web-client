import { db } from "@/firebase/serverConfig";
import { researchHistory } from "./researchHistory";
import { checkRun, runPipeline } from "./opportunityPipeline.mjs";
import { savePersonToNotion } from "./notionService";
import { createActivity } from "./activityService";
import { listEnabledAutomations, recordAutomationRun } from "./automationService";
import { recordDigestRun, getDigestSettings } from "./digestService";

const PROVIDER_LABELS = {
  explorium: "Explorium",
  bezalel: "Bezalel",
  vibe: "Vibe Prospecting",
};

const MAX_DELIVERED = 2000;

function personKey(person) {
  return `${person.name}|${person.role}`.toLowerCase();
}

function digestDate() {
  return new Date().toISOString().slice(0, 10);
}

async function collectPeople(body, signal, userId) {
  const history = body.provider === "explorium" ? await researchHistory(userId) : {};
  const people = [];
  await runPipeline(body, (event) => {
    if (event.type === "person") people.push(event.person);
  }, signal, history);
  return people;
}

function buildActivity(person, automation) {
  const source = PROVIDER_LABELS[person.provider] ?? person.provider ?? "Unknown";
  return {
    type: "prospect",
    source,
    category: "Prospects",
    subject: person.name,
    preview: `${person.role} · ${person.score != null ? `${person.score} ICP` : "ICP pending"}`,
    body: person.summary,
    evidence: [
      { source, title: "Public signal", excerpt: person.signal },
      { source: "Bezalel", title: "ICP fit", excerpt: person.fit },
      ...(person.sources?.length ? [{ source: "Sources", title: "Evidence", excerpt: person.sources.join(" · ") }] : []),
    ],
    suggestedAngle: person.hook,
    status: "unread",
    requiresAction: true,
    documentId: automation.documentId,
    documentTitle: automation.documentTitle ?? null,
    digestDate: digestDate(),
  };
}

async function runOutreachAutomation(automation, signal) {
  const docRef = db
    .collection("users")
    .doc(automation.userId)
    .collection("documents")
    .doc(automation.documentId);
  const docSnap = await docRef.get();
  if (!docSnap.exists) throw new Error("Document no longer exists.");
  const form = docSnap.data().opportunityForm;
  if (!form?.provider || !form?.prompt || !form?.target) {
    throw new Error("No saved targeting criteria for this document.");
  }

  const body = { provider: form.provider, prompt: form.prompt, target: form.target };
  checkRun(body);

  const delivered = new Set(automation.deliveredKeys ?? []);
  const people = await collectPeople(body, signal, automation.userId);

  let added = 0;
  for (const person of people) {
    const key = personKey(person);
    if (delivered.has(key)) continue;
    delivered.add(key);

    // Save to Notion best-effort; never block the activity write.
    try {
      await savePersonToNotion(person);
    } catch (error) {
      console.error("Notion save failed during digest:", error.message);
    }

    await createActivity(automation.userId, buildActivity(person, automation));
    added += 1;
  }

  const capped = [...delivered].slice(-MAX_DELIVERED);
  await recordAutomationRun(automation.userId, automation.documentId, capped);
  return added;
}

/**
 * Runs every enabled automation source once. Each source is independent, so a
 * failure in one document does not stop the others.
 *
 * @param {{ userId?: string|null, force?: boolean }} [options]
 *   - userId: when set, only that user's automations run.
 *   - force: when true, runs even if the user's digest is paused (manual run).
 */
export async function runDailyDigest({ userId = null, force = false } = {}) {
  const automations = await listEnabledAutomations(userId);
  const signal = AbortSignal.timeout(270_000);
  const startedAt = new Date();
  const executed = [];

  for (const automation of automations) {
    if (!force) {
      const settings = await getDigestSettings(automation.userId);
      if (settings.paused) continue;
    }
    try {
      const added = await runOutreachAutomation(automation, signal);
      executed.push({ userId: automation.userId, documentId: automation.documentId, added });
    } catch (error) {
      executed.push({ userId: automation.userId, documentId: automation.documentId, error: error.message });
    }
  }

  const byUser = new Map();
  for (const result of executed) {
    if (!byUser.has(result.userId)) byUser.set(result.userId, []);
    byUser.get(result.userId).push(result);
  }
  for (const [uid, results] of byUser) {
    await recordDigestRun(uid, startedAt, results);
  }

  return { ran: executed.length, results: executed };
}
