import { db } from "@/firebase/serverConfig";

const contextsCollection = db.collection("contexts");

export const saveContext = async (userId, contextData) => {
  try {
    const contextRef = contextsCollection.doc();
    const context = {
      userId,
      ...contextData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await contextRef.set(context);
    return { id: contextRef.id, ...context };
  } catch (error) {
    console.error("Error saving context:", error);
    throw error;
  }
};

export const getContext = async (contextId) => {
  try {
    const contextDoc = await contextsCollection.doc(contextId).get();
    if (!contextDoc.exists) {
      throw new Error("Context not found");
    }
    return { id: contextDoc.id, ...contextDoc.data() };
  } catch (error) {
    console.error("Error getting context:", error);
    throw error;
  }
};

export const getUserContexts = async (userId) => {
  try {
    const contextsSnapshot = await contextsCollection
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();

    return contextsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error getting user contexts:", error);
    throw error;
  }
};

export const updateContext = async (contextId, contextData) => {
  try {
    const contextRef = contextsCollection.doc(contextId);
    const updateData = {
      ...contextData,
      updatedAt: new Date().toISOString(),
    };

    await contextRef.update(updateData);
    return { id: contextId, ...updateData };
  } catch (error) {
    console.error("Error updating context:", error);
    throw error;
  }
};

export const deleteContext = async (contextId) => {
  try {
    await contextsCollection.doc(contextId).delete();
    return { message: "Context deleted successfully" };
  } catch (error) {
    console.error("Error deleting context:", error);
    throw error;
  }
};
