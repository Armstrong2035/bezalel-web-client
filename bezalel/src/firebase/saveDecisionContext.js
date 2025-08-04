// firebase/auth.js
import { doc, setDoc } from "firebase/firestore";
import { db } from "./config"; // Assuming your Firestore instance is exported

/**
 * Saves onboarding data to the 'contexts' collection
 * @param {string} userId - The user's ID
 * @param {Object} onboardingData - Data from useOnboardingStore
 * @returns {Promise<void>}
 */
export const saveOnboardingContext = async (userId, onboardingData) => {
  try {
    const contextDocRef = doc(db, "contexts", `${userId}_${Date.now()}`);
    await setDoc(contextDocRef, {
      userId,
      idea: onboardingData.idea || "",
      journey: onboardingData.journey || "",
      goal: onboardingData.goal || "",
      timeAvailability: onboardingData.timeAvailability || "",
      capital: onboardingData.capital || "",
      experienceLevel: onboardingData.experienceLevel || "",
      archetype: onboardingData.archetype || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error saving onboarding context:", error);
    throw error;
  }
};
