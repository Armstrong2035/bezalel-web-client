import { onSnapshot, doc } from "firebase/firestore";
import { db } from "./config";

export function subscribeToCanvasSegment(uid, callback) {
  const docRef = doc(db, "canvasSegments", uid);

  const unsubscribe = onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        let data = docSnap.data();
        callback(data);
        console.log(data);
      } else {
        console.log("No such document!");
        callback(null);
      }
    },
    (error) => {
      console.error("Snapshot error:", error);
    }
  );

  return unsubscribe;
}
