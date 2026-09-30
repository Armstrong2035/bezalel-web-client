import { db, admin } from "@/firebase/serverConfig";
import { validateContextChanges } from "./contextChanges.mjs";

// Apply reviewed fields atomically while preserving unrelated context edits.
export async function applyContextChanges(userId, documentId, changes, originalValues) {
  const validated = validateContextChanges(changes);
  const ref = db.collection("users").doc(userId).collection("documents").doc(documentId);
  return db.runTransaction(async transaction => {
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists) throw Object.assign(new Error("Business model not found."), { status: 404 });
    const current = snapshot.data().context ?? {};
    if (Object.keys(validated).some(key => (current[key] ?? "") !== originalValues[key])) {
      throw Object.assign(new Error("Context changed since this proposal. Generate a fresh proposal before applying it."), { status: 409 });
    }
    const context = { ...current, ...validated };
    transaction.update(ref, { context, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
    return context;
  });
}

