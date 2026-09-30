import { db, admin } from "@/firebase/serverConfig";
import { validateCanvasEdits } from "./canvasEdits.mjs";

export async function applyCanvasEdits(userId, documentId, edits) {
  const validated = validateCanvasEdits(edits, true);
  if (!validated.length) throw Object.assign(new Error("Select at least one canvas edit."), { status: 400 });
  const document = db.collection("users").doc(userId).collection("documents").doc(documentId);
  return db.runTransaction(async transaction => {
    const parent = await transaction.get(document);
    if (!parent.exists) throw Object.assign(new Error("Business model not found."), { status: 404 });
    const refs = validated.map(edit => document.collection("canvasSegments").doc(edit.ideaId));
    // Read every target before writing so a conflict cannot partially apply edits.
    const snapshots = await Promise.all(refs.map(ref => transaction.get(ref)));
    for (let i = 0; i < validated.length; i++) {
      const edit = validated[i], saved = snapshots[i].data();
      if (!snapshots[i].exists || saved.segment !== edit.segment || Object.keys(edit.changes).some(key => (saved[key] ?? "") !== edit.originalValues[key])) {
        throw Object.assign(new Error("A canvas idea changed or was removed since this proposal. Generate a fresh proposal before applying."), { status: 409 });
      }
    }
    validated.forEach((edit, i) => transaction.update(refs[i], {
      ...edit.changes, updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }));
    transaction.update(document, { updatedAt: admin.firestore.FieldValue.serverTimestamp() });
    return validated.map(edit => ({ id: edit.ideaId, changes: edit.changes }));
  });
}
