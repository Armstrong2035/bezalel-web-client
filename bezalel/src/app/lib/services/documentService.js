import { db, admin } from "@/firebase/serverConfig";

/**
 * Creates a new business model document for a user.
 * Stored at: users/{uid}/documents/{docId}
 *
 * @param {string} userId
 * @param {object} data - { title }
 * @returns {object} The created document with its id
 */
export const createDocument = async (userId, { title = "Untitled" } = {}) => {
  if (!userId) throw new Error("userId is required");

  const ref = db.collection("users").doc(userId).collection("documents").doc();

  const document = {
    id: ref.id,
    title,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await ref.set(document);
  return { ...document, id: ref.id };
};

/**
 * Lists all documents for a user, ordered newest first.
 *
 * @param {string} userId
 * @returns {Array<object>}
 */
export const listDocuments = async (userId) => {
  if (!userId) throw new Error("userId is required");

  const snapshot = await db
    .collection("users")
    .doc(userId)
    .collection("documents")
    .orderBy("createdAt", "desc")
    .get();

  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

/**
 * Updates the title (or other fields) of a document.
 *
 * @param {string} userId
 * @param {string} documentId
 * @param {object} updates - fields to update
 * @returns {object}
 */
export const updateDocument = async (userId, documentId, updates) => {
  if (!userId || !documentId) throw new Error("userId and documentId are required");

  const ref = db
    .collection("users")
    .doc(userId)
    .collection("documents")
    .doc(documentId);

  const payload = {
    ...updates,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await ref.update(payload);
  return { id: documentId, ...payload };
};

/**
 * Deletes a document and all its canvasSegments subcollection.
 * Note: subcollection deletion is done in batches.
 *
 * @param {string} userId
 * @param {string} documentId
 */
export const deleteDocument = async (userId, documentId) => {
  if (!userId || !documentId) throw new Error("userId and documentId are required");

  const docRef = db
    .collection("users")
    .doc(userId)
    .collection("documents")
    .doc(documentId);

  // Delete subcollection segments first (batch)
  const segmentsSnapshot = await docRef.collection("canvasSegments").get();
  const batchSize = segmentsSnapshot.docs.length;

  if (batchSize > 0) {
    const batch = db.batch();
    segmentsSnapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
  }

  await docRef.delete();
  return { success: true };
};

/**
 * Saves the business context for a document.
 * Context is stored as a `context` field directly on the document itself.
 * Stored at: users/{uid}/documents/{docId}  (field: context)
 *
 * @param {string} userId
 * @param {string} documentId
 * @param {object} context - the 8-question onboarding answers scoped to this doc
 * @returns {object}
 */
export const saveDocumentContext = async (userId, documentId, context) => {
  if (!userId || !documentId) throw new Error("userId and documentId are required");

  const ref = db
    .collection("users")
    .doc(userId)
    .collection("documents")
    .doc(documentId);

  await ref.update({
    context,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { id: documentId, context };
};

/**
 * Fetches a single document (including its context field).
 *
 * @param {string} userId
 * @param {string} documentId
 * @returns {object | null}
 */
export const getDocument = async (userId, documentId) => {
  if (!userId || !documentId) throw new Error("userId and documentId are required");

  const snap = await db
    .collection("users")
    .doc(userId)
    .collection("documents")
    .doc(documentId)
    .get();

  if (!snap.exists) return null;
  return { id: snap.id, ...snap.data() };
};

/**
 * Saves a generated canvas idea under a specific document.
 * Stored at: users/{uid}/documents/{docId}/canvasSegments/{ideaId}
 *
 * @param {string} userId
 * @param {string} documentId
 * @param {object} ideaData
 * @returns {string} The new idea document ID
 */
export const saveIdeaToDocument = async (userId, documentId, ideaData) => {
  if (!userId || !documentId) throw new Error("userId and documentId are required");

  const ref = db
    .collection("users")
    .doc(userId)
    .collection("documents")
    .doc(documentId)
    .collection("canvasSegments")
    .doc();

  const docId = ref.id;

  await ref.set({
    ...ideaData,
    id: docId,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return docId;
};

/**
 * Updates the accepted status of an idea within a specific document.
 *
 * @param {string} userId
 * @param {string} documentId
 * @param {string} ideaId
 * @param {boolean} accepted
 */
export const updateIdeaInDocument = async (userId, documentId, ideaId, accepted) => {
  if (!userId || !documentId || !ideaId) {
    throw new Error("userId, documentId and ideaId are required");
  }

  const ref = db
    .collection("users")
    .doc(userId)
    .collection("documents")
    .doc(documentId)
    .collection("canvasSegments")
    .doc(ideaId);

  await ref.update({
    accepted,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { success: true };
};

/**
 * Deletes a single canvas idea from a document.
 *
 * @param {string} userId
 * @param {string} documentId
 * @param {string} ideaId
 */
export const deleteIdeaFromDocument = async (userId, documentId, ideaId) => {
  if (!userId || !documentId || !ideaId) {
    throw new Error("userId, documentId and ideaId are required");
  }

  await db
    .collection("users")
    .doc(userId)
    .collection("documents")
    .doc(documentId)
    .collection("canvasSegments")
    .doc(ideaId)
    .delete();

  return { success: true };
};

/**
 * Saves research results onto an existing idea document.
 * Patches the `research` field without overwriting other idea data.
 *
 * @param {string} userId
 * @param {string} documentId
 * @param {string} ideaId
 * @param {object} research - structured research result
 */
export const saveIdeaResearch = async (userId, documentId, ideaId, research) => {
  if (!userId || !documentId || !ideaId) {
    throw new Error("userId, documentId and ideaId are required");
  }

  const ref = db
    .collection("users")
    .doc(userId)
    .collection("documents")
    .doc(documentId)
    .collection("canvasSegments")
    .doc(ideaId);

  await ref.update({
    research: {
      ...research,
      fetchedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { success: true };
};

// ── Chat message storage ─────────────────────────────────────────────────────

/**
 * Saves a single chat message to users/{uid}/documents/{docId}/chat/{msgId}.
 *
 * @param {string} userId
 * @param {string} documentId
 * @param {{ role: 'user'|'assistant', content: string }} message
 * @returns {string} The new message document ID
 */
export const saveChatMessage = async (userId, documentId, message) => {
  if (!userId || !documentId) throw new Error("userId and documentId are required");

  const ref = db
    .collection("users")
    .doc(userId)
    .collection("documents")
    .doc(documentId)
    .collection("chat")
    .doc();

  await ref.set({
    id: ref.id,
    role: message.role,
    content: message.content,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return ref.id;
};

/**
 * Loads the full chat history for a document, ordered oldest first.
 *
 * @param {string} userId
 * @param {string} documentId
 * @returns {Array<{ id, role, content, createdAt }>}
 */
export const loadChatHistory = async (userId, documentId) => {
  if (!userId || !documentId) throw new Error("userId and documentId are required");

  const snapshot = await db
    .collection("users")
    .doc(userId)
    .collection("documents")
    .doc(documentId)
    .collection("chat")
    .orderBy("createdAt", "asc")
    .get();

  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

/**
 * Deletes all chat messages for a document (clear history).
 *
 * @param {string} userId
 * @param {string} documentId
 */
export const clearChatHistory = async (userId, documentId) => {
  if (!userId || !documentId) throw new Error("userId and documentId are required");

  const snapshot = await db
    .collection("users")
    .doc(userId)
    .collection("documents")
    .doc(documentId)
    .collection("chat")
    .get();

  if (snapshot.empty) return { success: true };

  const batch = db.batch();
  snapshot.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();

  return { success: true };
};
