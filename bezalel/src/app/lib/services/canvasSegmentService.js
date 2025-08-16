import { db, admin } from "@/firebase/serverConfig";

/**
 * Saves a generated idea to a specific Firestore path for the user.
 * It uses the Firebase Admin SDK's .add() method to create a new document with an auto-generated ID.
 * @param {string} userId The ID of the authenticated user.
 * @param {object} ideaData The data object for the idea, including title, description, etc.
 * @returns {string} The ID of the newly created Firestore document.
 */
export const saveGeneratedIdea = async (userId, ideaData) => {
  if (!userId) {
    throw new Error("userId is required to save an idea.");
  }

  try {
    // Define the Firestore collection path
    // We'll use the doc() method without an ID to create a new, auto-generated ID first.
    const canvasDocRef = db
      .collection("users")
      .doc(userId)
      .collection("canvasSegments")
      .doc();

    // Now, we can get the auto-generated ID from the document reference
    const docId = canvasDocRef.id;

    // Use set() instead of add() to explicitly set the document with the data,
    // including the new ID field.
    await canvasDocRef.set({
      ...ideaData,
      id: docId, // **This is the key change!** We add the document ID to the data.
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log("Document successfully written with ID:", docId);
    return docId;
  } catch (error) {
    console.error("Error writing document:", error);
    throw new Error("Failed to save idea to Firestore.");
  }
};

/**
 * Updates the 'accepted' status of a specific idea.
 * It uses the Firebase Admin SDK's .update() method to modify an existing document.
 * @param {string} userId The ID of the authenticated user.
 * @param {string} ideaId The ID of the idea document to update.
 * @param {boolean} accepted The new 'accepted' status.
 */
export const updateIdeaStatus = async (userId, ideaId, accepted) => {
  if (!userId || !ideaId) {
    throw new Error("userId and ideaId are required to update an idea.");
  }

  try {
    // Define the Firestore document path using the Firebase Admin SDK syntax
    const ideaRef = db
      .collection("users")
      .doc(userId)
      .collection("canvasSegments")
      .doc(ideaId);

    // Update the document with the new 'accepted' status and timestamp
    await ideaRef.update({
      accepted,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`Document ${ideaId} successfully updated.`);
  } catch (error) {
    console.error(`Error updating document ${ideaId}:`, error);
    throw new Error("Failed to update idea status.");
  }
};

/**
 * Fetches ideas from a specific segment for a user.
 * It uses the Firebase Admin SDK's .where() method for filtering.
 * @param {string} userId The ID of the authenticated user.
 * @param {string} segment The segment to filter by.
 * @param {boolean} acceptedOnly If true, only retrieve ideas where 'accepted' is true.
 * @returns {Array<object>} An array of idea data objects.
 */
export const getIdeasBySegment = async (
  userId,
  segment,
  acceptedOnly = false
) => {
  if (!userId || !segment) {
    throw new Error("userId and segment are required to get ideas.");
  }

  try {
    // Start the query chain from the collection reference
    let queryRef = db
      .collection("users")
      .doc(userId)
      .collection("canvasSegments")
      .where("segment", "==", segment);

    // Conditionally add a filter for accepted ideas
    if (acceptedOnly) {
      queryRef = queryRef.where("accepted", "==", true);
    }

    // Execute the query and get the documents
    const snapshot = await queryRef.get();

    // Map the documents to an array of data objects
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error getting documents:", error);
    throw new Error("Failed to retrieve ideas.");
  }
};
