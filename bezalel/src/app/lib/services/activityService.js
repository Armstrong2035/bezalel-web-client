import { db, admin } from "@/firebase/serverConfig";

/**
 * Durable inbox activity. The daily digest (and future sources like social
 * listening) write here; the email inbox reads from here.
 * Stored at: users/{uid}/activity/{activityId}
 */

function serialize(doc) {
  const data = doc.data();
  const createdAt = data.createdAt?.toMillis?.() ?? data.createdAt ?? null;
  return { id: doc.id, ...data, createdAt };
}

export async function createActivity(userId, activity) {
  const ref = db.collection("users").doc(userId).collection("activity").doc();
  await ref.set({
    ...activity,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  return ref.id;
}

export async function listActivities(userId) {
  const snapshot = await db
    .collection("users")
    .doc(userId)
    .collection("activity")
    .orderBy("createdAt", "desc")
    .limit(200)
    .get();
  return snapshot.docs.map(serialize);
}

export async function updateActivityStatus(userId, activityId, status) {
  await db
    .collection("users")
    .doc(userId)
    .collection("activity")
    .doc(activityId)
    .update({ status });
  return { success: true };
}

export async function removeActivity(userId, activityId) {
  await db
    .collection("users")
    .doc(userId)
    .collection("activity")
    .doc(activityId)
    .delete();
  return { success: true };
}
