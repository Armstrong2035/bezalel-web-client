import { onSnapshot, collection } from "firebase/firestore";
import { db } from "@/firebase/config";

/**
 * Subscribes to real-time updates for all canvas ideas within a specific document.
 * Path: users/{uid}/documents/{docId}/canvasSegments
 *
 * @param {string} uid - Firebase user ID
 * @param {string} docId - Document ID
 * @param {function} callback - Called with a flat object keyed by idea ID
 * @returns {function} Unsubscribe function
 */
export function subscribeToDocumentSegments(uid, docId, callback, onError) {
  if (!uid || !docId) {
    console.warn("subscribeToDocumentSegments: uid and docId are required");
    return () => {};
  }

  const collectionRef = collection(db, "users", uid, "documents", docId, "canvasSegments");

  const unsubscribe = onSnapshot(
    collectionRef,
    { includeMetadataChanges: true },
    (querySnapshot) => {
      // The document loader has already read the server. An initial local-cache
      // snapshot (including an empty cache after refresh) must not overwrite it.
      // Local pending edits can still render; the server snapshot confirms them.
      if (querySnapshot.metadata.fromCache && !querySnapshot.metadata.hasPendingWrites) return;
      const segmentsData = {};
      querySnapshot.forEach((doc) => {
        segmentsData[doc.id] = { id: doc.id, ...doc.data() };
      });
      callback(segmentsData);
    },
    (error) => {
      console.error("subscribeToDocumentSegments snapshot error:", error);
      onError?.(error);
    }
  );

  return unsubscribe;
}
