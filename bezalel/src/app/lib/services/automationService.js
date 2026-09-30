import { db, admin } from "@/firebase/serverConfig";

/**
 * Per-document automation configuration. Stored in a top-level `automations`
 * collection (not under users) so the cron runner can query all enabled jobs
 * with a single `where("enabled", "==", true)` without collection-group
 * indexes. Each document id is `${userId}_${documentId}`.
 */
const collection = () => db.collection("automations");

const automationId = (userId, documentId) => `${userId}_${documentId}`;

export async function getAutomation(userId, documentId) {
  const snap = await collection().doc(automationId(userId, documentId)).get();
  return snap.exists ? { id: snap.id, ...snap.data() } : null;
}

export async function setAutomationEnabled(userId, documentId, enabled, documentTitle = null) {
  const id = automationId(userId, documentId);
  const ref = collection().doc(id);
  await ref.set(
    {
      userId,
      documentId,
      enabled,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      ...(documentTitle ? { documentTitle } : {}),
    },
    { merge: true },
  );
  return { id, enabled };
}

export async function listEnabledAutomations(userId) {
  // Query one field at a time to avoid a composite index. The per-user path
  // fetches by userId and filters enabled in memory (a user has few documents).
  if (userId) {
    const snapshot = await collection().where("userId", "==", userId).get();
    return snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((a) => a.enabled === true);
  }
  const snapshot = await collection().where("enabled", "==", true).get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function listAutomationsForUser(userId) {
  const snapshot = await collection().where("userId", "==", userId).get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function recordAutomationRun(userId, documentId, deliveredKeys) {
  await collection().doc(automationId(userId, documentId)).update({
    lastRunAt: admin.firestore.FieldValue.serverTimestamp(),
    deliveredKeys,
  });
}
