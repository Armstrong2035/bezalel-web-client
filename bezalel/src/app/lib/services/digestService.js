import { db, admin } from "@/firebase/serverConfig";

/**
 * Digest run history and settings. Run records live at
 * users/{uid}/digestRuns/{runId}; the pause flag lives at
 * users/{uid}/settings/digest.
 */

const runsCollection = (userId) =>
  db.collection("users").doc(userId).collection("digestRuns");

const settingsRef = (userId) =>
  db.collection("users").doc(userId).collection("settings").doc("digest");

export async function recordDigestRun(userId, startedAt, results) {
  const added = results.reduce((sum, r) => sum + (r.added ?? 0), 0);
  const errorCount = results.filter((r) => r.error).length;
  const status =
    errorCount === 0
      ? "success"
      : errorCount === results.length
        ? "failed"
        : "partial";

  const ref = runsCollection(userId).doc();
  await ref.set({
    id: ref.id,
    startedAt,
    finishedAt: admin.firestore.FieldValue.serverTimestamp(),
    status,
    added,
    results,
  });
  return ref.id;
}

function serializeRun(doc) {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    startedAt: data.startedAt?.toMillis?.() ?? data.startedAt ?? null,
    finishedAt: data.finishedAt?.toMillis?.() ?? data.finishedAt ?? null,
  };
}

export async function listDigestRuns(userId, limit = 20) {
  const snapshot = await runsCollection(userId)
    .orderBy("startedAt", "desc")
    .limit(limit)
    .get();
  return snapshot.docs.map(serializeRun);
}

export async function getDigestSettings(userId) {
  const snap = await settingsRef(userId).get();
  return snap.exists ? snap.data() : { paused: false };
}

export async function setDigestPaused(userId, paused) {
  await settingsRef(userId).set(
    { paused, updatedAt: admin.firestore.FieldValue.serverTimestamp() },
    { merge: true },
  );
  return { paused };
}
