import { db } from "../config/firebase.js";

const canvasSegmentsCollection = db.collection("canvasSegments");

export const saveGeneratedIdea = async (userId, ideaData) => {
  const ideaRef = doc(collection(db, `users/${userId}/canvasSegments`));
  await setDoc(ideaRef, {
    ...ideaData,
    accepted: false,
    createdAt: serverTimestamp(),
  });
  return ideaRef.id;
};

export const updateIdeaStatus = async (userId, ideaId, accepted) => {
  const ideaRef = doc(db, `users/${userId}/canvasSegments/${ideaId}`);
  await updateDoc(ideaRef, {
    accepted,
    updatedAt: serverTimestamp(),
  });
};

export const getIdeasBySegment = async (
  userId,
  segment,
  acceptedOnly = false
) => {
  let q = query(
    collection(db, `users/${userId}/canvasSegments`),
    where("segment", "==", segment)
  );

  if (acceptedOnly) {
    q = query(q, where("accepted", "==", true));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};
