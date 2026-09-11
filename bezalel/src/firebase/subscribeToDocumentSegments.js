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
export function subscribeToDocumentSegments(uid, docId, callback) {
  if (!uid || !docId) {
    console.warn("subscribeToDocumentSegments: uid and docId are required");
    return () => {};
  }

  const collectionRef = collection(db, "users", uid, "documents", docId, "canvasSegments");

  const unsubscribe = onSnapshot(
    collectionRef,
    (querySnapshot) => {
      const segmentsData = {};
      querySnapshot.forEach((doc) => {
        segmentsData[doc.id] = { id: doc.id, ...doc.data() };
      });
      callback(segmentsData);
    },
    (error) => {
      console.error("subscribeToDocumentSegments snapshot error:", error);
    }
  );

  return unsubscribe;
}
