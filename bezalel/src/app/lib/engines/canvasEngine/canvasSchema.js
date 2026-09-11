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

const sectionTitles = {
  customerSegments: "Customer Segments",
  valueProposition: "Value Propositions",
  channels: "Channels",
  customerRelationships: "Customer Relationships",
  revenueStreams: "Revenue Streams",
  keyResources: "Key Resources",
  keyActivities: "Key Activities",
  keyPartners: "Key Partners",
  costStructure: "Cost Structure",
};

function buildAcceptedDecisions(ideas, targetSegment) {
  const activeIdeas = ideas
    .filter((idea) => idea.decisionStatus === "now" || (!idea.decisionStatus && idea.accepted))
    .sort((a, b) => (a.priority ?? Number.MAX_SAFE_INTEGER) - (b.priority ?? Number.MAX_SAFE_INTEGER));
  if (activeIdeas.length === 0) {
    return "No canvas decisions have been accepted yet.";
  }

  const decisions = activeIdeas
    .map((idea) => {
      const title = sectionTitles[idea.segment] ?? idea.segment;
      const description = idea.description ? ` — ${idea.description}` : "";
      const priority = idea.priority ? ` (priority ${idea.priority})` : "";
      return `- ${title}${priority}: "${idea.title}"${description}`;
    })
    .join("\n");

  const acceptedCustomers = activeIdeas.filter(
    (idea) => idea.segment === "customerSegments"
  );
  const customerConstraint =
    targetSegment === "valueProposition" && acceptedCustomers.length > 0
      ? `\n\nFor this value-proposition generation, the accepted Customer Segment(s) above are fixed. Every option must directly serve those customers and solve a problem they have. Do not introduce, replace, or target a different customer segment.`
      : "";

  return `The founder has already accepted these canvas decisions:\n${decisions}\n\nTreat accepted decisions as constraints. Build on them and do not contradict or replace them unless the user explicitly asks to revisit that decision.${customerConstraint}`;
}

export const createPrompt = async (context, segment, userId, canvasIdeas = []) => {
  try {
    // Get user's existing canvas and decisions
    let decisionContext = "";
    // if (userId) {
    //   const existingCanvas = await getUserCanvas(userId);
    //   //Receive deicisons and add to prompts as objects.
    // }

    // Build the base prompt with instructions using the provided context
    const acceptedDecisions = buildAcceptedDecisions(canvasIdeas, segment);
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

ACCEPTED CANVAS DECISIONS:
${acceptedDecisions}


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
