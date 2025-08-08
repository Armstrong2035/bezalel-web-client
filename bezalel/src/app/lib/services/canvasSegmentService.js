import { db } from "../config/firebase.js";

const canvasSegmentsCollection = db.collection("canvasSegments");

export const saveCanvasSegment = async (userId, segment, options) => {
  try {
    // Check if user already has a canvas document
    const existingCanvas = await getUserCanvas(userId);

    if (existingCanvas) {
      // Update existing canvas with new segment
      const canvasRef = canvasSegmentsCollection.doc(existingCanvas.id);
      const updateData = {
        [`segments.${segment}`]: {
          options: options.map((option) => ({
            ...option,
            status: "pending",
            acceptedAt: null,
            rejectedAt: null,
          })),
          updatedAt: new Date().toISOString(),
          generatedAt: new Date().toISOString(),
        },
        updatedAt: new Date().toISOString(),
      };

      await canvasRef.update(updateData);
      return await getCanvasSegment(existingCanvas.id);
    } else {
      // Create new canvas document
      const canvasRef = canvasSegmentsCollection.doc();
      const canvasData = {
        userId,
        canvasName: `${userId}'s Business Model Canvas`,
        segments: {
          [segment]: {
            options: options.map((option) => ({
              ...option,
              status: "pending",
              acceptedAt: null,
              rejectedAt: null,
            })),
            updatedAt: new Date().toISOString(),
            generatedAt: new Date().toISOString(),
          },
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: "in_progress",
        decisions: {},
      };

      await canvasRef.set(canvasData);
      return { id: canvasRef.id, ...canvasData };
    }
  } catch (error) {
    console.error("Error saving canvas segment:", error);
    throw error;
  }
};

export const getCanvasSegment = async (canvasId) => {
  try {
    const canvasDoc = await canvasSegmentsCollection.doc(canvasId).get();
    if (!canvasDoc.exists) {
      throw new Error("Canvas not found");
    }
    return { id: canvasDoc.id, ...canvasDoc.data() };
  } catch (error) {
    console.error("Error getting canvas:", error);
    throw error;
  }
};

export const getUserCanvas = async (userId) => {
  try {
    const canvasSnapshot = await canvasSegmentsCollection
      .where("userId", "==", userId)
      .limit(1)
      .get();

    if (canvasSnapshot.empty) {
      return null;
    }

    const doc = canvasSnapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  } catch (error) {
    console.error("Error getting user canvas:", error);
    throw error;
  }
};

export const getUserCanvasSegments = async (userId, segment) => {
  try {
    const canvas = await getUserCanvas(userId);
    if (!canvas) {
      return null;
    }

    if (segment) {
      return canvas.segments[segment] || null;
    }

    return canvas;
  } catch (error) {
    console.error("Error getting user canvas segments:", error);
    throw error;
  }
};

export const updateOptionStatus = async (
  canvasId,
  segment,
  optionId,
  status
) => {
  try {
    const canvasRef = canvasSegmentsCollection.doc(canvasId);
    const canvas = await canvasRef.get();

    if (!canvas.exists) {
      throw new Error("Canvas not found");
    }

    const canvasData = canvas.data();
    const segmentData = canvasData.segments[segment];

    if (!segmentData) {
      throw new Error("Segment not found");
    }

    // Update the specific option
    const updatedOptions = segmentData.options.map((option) => {
      if (option.id === optionId) {
        return {
          ...option,
          status,
          [status === "accepted" ? "acceptedAt" : "rejectedAt"]:
            new Date().toISOString(),
        };
      }
      return option;
    });

    // Update decisions summary
    const acceptedOptions = updatedOptions.filter(
      (opt) => opt.status === "accepted"
    );
    const decisions = {
      ...canvasData.decisions,
      [segment]: {
        accepted: acceptedOptions.map((opt) => opt.title),
        summary: generateDecisionSummary(acceptedOptions),
      },
    };

    // Update the document
    const updateData = {
      [`segments.${segment}.options`]: updatedOptions,
      [`segments.${segment}.updatedAt`]: new Date().toISOString(),
      decisions,
      updatedAt: new Date().toISOString(),
    };

    await canvasRef.update(updateData);
    return await getCanvasSegment(canvasId);
  } catch (error) {
    console.error("Error updating option status:", error);
    throw error;
  }
};

export const createNewCanvas = async (userId, canvasName = null) => {
  try {
    const canvasRef = canvasSegmentsCollection.doc();
    const canvasData = {
      userId,
      canvasName: canvasName || `${userId}'s Business Model Canvas`,
      segments: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "in_progress",
      decisions: {},
    };

    await canvasRef.set(canvasData);
    return { id: canvasRef.id, ...canvasData };
  } catch (error) {
    console.error("Error creating new canvas:", error);
    throw error;
  }
};

// Helper function to generate decision summary
const generateDecisionSummary = (acceptedOptions) => {
  if (acceptedOptions.length === 0) {
    return "No options selected yet";
  }

  // Extract key information from accepted options
  const summary = {
    selectedCount: acceptedOptions.length,
    selectedTitles: acceptedOptions.map((opt) => opt.title),
    descriptions: acceptedOptions.map((opt) => opt.description),
    actionPlans: acceptedOptions.map((opt) => opt.actionPlan),
    keyInsights: acceptedOptions.map((opt) => ({
      title: opt.title,
      description: opt.description,
      week1: opt.actionPlan.week1,
      week2: opt.actionPlan.week2,
    })),
  };

  return JSON.stringify(summary);
};
