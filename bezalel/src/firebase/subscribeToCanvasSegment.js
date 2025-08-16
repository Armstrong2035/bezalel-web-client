import { onSnapshot, collection } from "firebase/firestore";
import { db } from "@/firebase/config";

export function subscribeToCanvasSegments(uid, callback) {
  // Use a global variable for the app ID.
  // const appId = typeof __app_id !== "undefined" ? __app_id : "default-app-id";

  // Use the public path for data that can be shared or collaborated on.
  // The 'canvases' collection will store each user's canvas document.
  const collectionRef = collection(db, "users", uid, "canvasSegments");

  const unsubscribe = onSnapshot(
    collectionRef,
    (querySnapshot) => {
      let segmentsData = {};
      querySnapshot.forEach((doc) => {
        // We'll use the document ID as the key to store the data
        segmentsData[doc.id] = segmentsData[doc.id] = {
          id: doc.id,
          ...doc.data(),
        };
      });
      callback(segmentsData);
      console.log(segmentsData);
    },
    (error) => {
      console.error("Snapshot error:", error);
    }
  );

  return unsubscribe;
}
