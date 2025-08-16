import {
  levels,
  capitalOptions,
  timeAvailabilities,
  goals,
  archetypes,
  journeyStages,
  backgroundStrengths,
} from "../decisionEngine/pathwayPrompts.js";
import { segmentPrompts } from "./segmentPrompts.js";

export const canvasSegmentSchema = {
  segment: "", //e.g value proposition, customer segment, etc.
  cards: [],
};

export const createPrompt = async (context, segment, userId) => {
  try {
    // Get user's existing canvas and decisions
    let decisionContext = "";
    // if (userId) {
    //   const existingCanvas = await getUserCanvas(userId);
    //   //Receive deicisons and add to prompts as objects.
    // }

    // Build the base prompt with instructions using the provided context
    const basePrompt = `
You are a helpful assistant that helps users create a business model canvas.

The business idea is: ${context.idea}.

Your instructions are as follows for this user: 
${levels[context.experienceLevel]}.
${goals[context.goal]}.
${timeAvailabilities[context.timeAvailability]}.
${capitalOptions[context.capital]}.
${archetypes[context.archetype]}.
${journeyStages[context.journey]}.
${backgroundStrengths[context.background]}.


${segmentPrompts[segment]}

Return your response in the following JSON structure:
{
  "segment": "${segment}",
  "options": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "assumptionsToTest": [
        {
          "assumption": "string",
          "validationMethod": "string",
          "successCriteria": "string"
        }
      ],
      "scores": {
        "easeOfExecution": {
          "score": number,
          "reasoning": "string"
        },
        "resourceAlignment": {
          "score": number,
          "reasoning": "string"
        },
        "marketFit": {
          "score": number,
          "reasoning": "string"
        }
      },
      "actionPlan": {
        "week1": "string",
        "week2": "string",
        "week3": "string",
        "week4": "string"
      },
      "dependencies": {
        "required": ["string"],
        "blockedBy": ["string"]
      }
    }
  ]
}

For each option:
- Keep descriptions concise (1-2 sentences)
- List 2-3 key assumptions that need validation
- For each assumption, specify how to test it and what success looks like
- Scores should be numbers between 1-10
- Reasoning should be brief but specific
- Action items should be concrete and testable
- Dependencies should reference specific items or segments

Focus on options that can be tested with real customers immediately. Prioritize execution over planning.
`;

    return basePrompt;
  } catch (error) {
    console.error("Error creating prompt:", error);
    throw error;
  }
};
