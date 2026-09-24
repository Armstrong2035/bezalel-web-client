import OpenAI from "openai";
import { buildCanvasReasoning } from "@/app/lib/engines/canvasEngine/canvasReasoning";

/**
 * Builds the research prompt with canvas reasoning chain embedded.
 * The reasoning chain gives the AI full canvas context so it researches
 * this idea in relation to the whole business model — not in isolation.
 *
 * @param {{ title, description }} idea
 * @param {object} context  — doc business context fields
 * @param {object} documentSnapshot — { title, context, ideas } for reasoning chain
 */
function buildResearchPrompt(idea, context, documentSnapshot) {
  const contextLines = [
    context?.idea           ? `Business idea: ${context.idea}`                   : null,
    context?.archetype      ? `Business type: ${context.archetype}`               : null,
    context?.goal           ? `Founder's goal: ${context.goal}`                   : null,
    context?.experienceLevel? `Experience level: ${context.experienceLevel}`      : null,
  ]
    .filter(Boolean)
    .join("\n");

  // Build the full reasoning chain — the AI analyses the whole canvas
  // before forming research questions, so results are grounded in the
  // specific context of this business model, not generic market research.
  const reasoningChain = documentSnapshot
    ? buildCanvasReasoning(documentSnapshot)
    : "";

  return `You are a startup research analyst with deep knowledge of business models.

BUSINESS CONTEXT:
${contextLines}

${reasoningChain}

SPECIFIC IDEA TO RESEARCH:
Title: ${idea.title}
Description: ${idea.description}

RESEARCH INSTRUCTIONS:
Using the canvas reasoning chain above, you understand where this idea sits in the
broader business model. Research this idea with that context in mind:

1. Find competitors — but specifically ones that compete with this COMBINATION of
   value proposition + customer segment, not just the idea in isolation.
2. Find market signals — prioritise signals that speak to the demand for this type
   of solution FOR this type of customer.
3. Find customer evidence — look for voices from the specific customer segment
   described in the canvas, not generic users.
4. If the reasoning chain flagged contradictions involving this idea, research
   whether those contradictions have been resolved by successful companies
   (i.e., is there a proven pattern?) or whether they represent genuine risk.

After searching, return a JSON object in this EXACT structure (no markdown, raw JSON only):
{
  "verdict": "validates" | "challenges" | "mixed",
  "verdictReasoning": "2-3 sentences covering both the idea itself AND how it fits the broader canvas",
  "competitors": [
    { "name": "string", "url": "string", "summary": "string" }
  ],
  "marketSignals": [
    { "insight": "string", "source": "string", "url": "string" }
  ],
  "customerEvidence": [
    { "quote": "string", "sentiment": "positive" | "negative" | "mixed", "source": "string", "url": "string" }
  ]
}

Rules:
- competitors: up to 5 real companies with real URLs
- marketSignals: up to 5 concrete data points (numbers, trends, facts)
- customerEvidence: up to 4 real quotes or paraphrases from real sources
- All URLs must be real and working
- If you cannot find evidence for a category, return an empty array — never fabricate
- verdict must honestly reflect the weight of evidence found, including canvas fit`;
}

/**
 * Parses and normalises the OpenAI response text.
 * Handles markdown code fences and validates all fields.
 */
function parseResearchResponse(text) {
  const cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  const parsed = JSON.parse(cleaned);

  return {
    verdict: ["validates", "challenges", "mixed"].includes(parsed.verdict)
      ? parsed.verdict
      : "mixed",
    verdictReasoning: parsed.verdictReasoning ?? "",
    competitors: Array.isArray(parsed.competitors)
      ? parsed.competitors.slice(0, 5).map((c) => ({
          name: c.name ?? "",
          url: c.url ?? "",
          summary: c.summary ?? "",
        }))
      : [],
    marketSignals: Array.isArray(parsed.marketSignals)
      ? parsed.marketSignals.slice(0, 5).map((s) => ({
          insight: s.insight ?? "",
          source: s.source ?? "",
          url: s.url ?? "",
        }))
      : [],
    customerEvidence: Array.isArray(parsed.customerEvidence)
      ? parsed.customerEvidence.slice(0, 4).map((e) => ({
          quote: e.quote ?? "",
          sentiment: ["positive", "negative", "mixed"].includes(e.sentiment)
            ? e.sentiment
            : "mixed",
          source: e.source ?? "",
          url: e.url ?? "",
        }))
      : [],
  };
}

/**
 * Runs live web research on a single idea using OpenAI Responses API
 * with the web_search_preview tool. The canvas reasoning chain is embedded
 * in the prompt so research is grounded in the full business model context.
 *
 * @param {{ title: string, description: string }} idea
 * @param {object} context  — document business context fields
 * @param {object} documentSnapshot — full { title, context, ideas } for reasoning
 * @returns {object} Structured research result
 */
export const researchIdea = async (idea, context, documentSnapshot = null, signal) => {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 120_000, maxRetries: 0 });
  const prompt = buildResearchPrompt(idea, context, documentSnapshot);

  const response = await client.responses.create({
    model: "gpt-4o-mini",
    tools: [{ type: "web_search_preview" }],
    tool_choice: "required",
    input: prompt,
  }, { signal });

  const outputText = response.output
    .filter((block) => block.type === "message")
    .flatMap((block) => block.content)
    .filter((c) => c.type === "output_text")
    .map((c) => c.text)
    .join("");

  if (!outputText) {
    throw new Error("OpenAI returned no text output");
  }

  return parseResearchResponse(outputText);
};
