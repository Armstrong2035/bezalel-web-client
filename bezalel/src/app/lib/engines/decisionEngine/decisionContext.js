import { saveContext } from "../../services/contextService.js";
import {
  levels,
  capitalOptions,
  timeAvailabilities,
  goals,
  archetypes,
} from "./pathwayPrompts.js";

const mapDecisionContext = (onBoardData) => {
  if (!onBoardData || typeof onBoardData !== "object") {
    throw new Error("onBoardData must be an object");
  }

  const context = {
    idea: onBoardData.idea,
    experienceLevel: onBoardData.experienceLevel,
    goal: onBoardData.goal,
    timeAvailability: onBoardData.timeAvailability,
    capital: onBoardData.capital,
    archetype: onBoardData.archetype,
  };

  return context;
};

export const saveToMemory = async (userId, onBoardData) => {
  try {
    // Map and save to Firestore
    const context = mapDecisionContext(onBoardData);
    const savedContext = await saveContext(userId, context);
    return savedContext;
  } catch (error) {
    console.error("Error saving context:", error);
    throw error;
  }
};

// Example usage:
// const onBoardData = {
//   experienceLevel: "beginner",
//   goal: "Side hustle",
//   timeAvailability: "Max 5",
//   capital: "0 - 100",
//   archetype: "SaaS / Cloud Software",
//   idea: "An AI-powered resume builder for freelancers",
// };

//console.log(mapDecisionContext(onBoardData));
// saveToMemory("userId123", onBoardData);

// Export the mapping functions for use elsewhere
