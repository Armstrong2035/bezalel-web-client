import {
  levels,
  capitalOptions,
  timeAvailabilities,
  goals,
  archetypes,
} from "../decisionEngine/businessTypePathways/pathwayPrompts.js";
import { segmentPrompts } from "./segmentPrompts.js";
import { getUserCanvas } from "../../services/canvasSegmentService.js";

export const canvasSegmentSchema = {
  segment: "", //e.g value proposition, customer segment, etc.
  cards: [],
};

export const createPrompt = async (context, segment, userId) => {
  try {
    // Get user's existing canvas and decisions
    let decisionContext = "";
    if (userId) {
      const existingCanvas = await getUserCanvas(userId);
      if (existingCanvas && existingCanvas.decisions) {
        const decisionText = Object.entries(existingCanvas.decisions)
          .map(([seg, data]) => {
            try {
              const summary = JSON.parse(data.summary);
              return `${seg}:
  - Selected: ${summary.selectedCount} options
  - Options: ${summary.selectedTitles.join(", ")}
  - Key insights: ${summary.keyInsights
    .map(
      (insight) =>
        `${insight.title}: ${insight.description.substring(0, 100)}...`
    )
    .join(" | ")}`;
            } catch (e) {
              // Fallback for old format
              return `${seg}: ${data.summary}`;
            }
          })
          .join("\n\n");

        if (decisionText) {
          decisionContext = `\n\n=== PREVIOUS DECISIONS ===
${decisionText}

Use these previous decisions to inform your recommendations for ${segment}. Consider:
- The specific options the user has already chosen
- The themes and focus areas from their selected descriptions
- How your recommendations can build upon their chosen action plans

=== END PREVIOUS DECISIONS ===\n`;
        }
      }
    }

    // Build the base prompt with instructions using the provided context
    const basePrompt = `
You are a helpful assistant that helps users create a business model canvas.

The user's idea is ${context.idea}.
The user's experience level is ${levels[context.experienceLevel]}.
The user's goal is ${goals[context.goal]}.
The user's time availability is ${timeAvailabilities[context.timeAvailability]}.
The user's capital is ${capitalOptions[context.capital]}.
The user's archetype is ${archetypes[context.archetype]}.${decisionContext}

${segmentPrompts[segment]}

Return your response in the following JSON structure:
{
  "segment": "string",
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
