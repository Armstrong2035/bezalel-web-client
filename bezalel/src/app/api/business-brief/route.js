import { withAuth } from "@/app/lib/withAuth";
import { NextResponse } from "next/server";
import { generateCanvasSegment } from "@/app/lib/services/llmService";

async function handlePOST(request) {
  try {
    const { title, context, ideas } = await request.json();

    if (!context?.idea?.trim()) {
      return NextResponse.json({ error: "Document context is required." }, { status: 400 });
    }

    const activeIdeas = (ideas ?? [])
      .filter((idea) => idea.decisionStatus === "now" || (!idea.decisionStatus && idea.accepted))
      .sort((a, b) => (a.priority ?? Number.MAX_SAFE_INTEGER) - (b.priority ?? Number.MAX_SAFE_INTEGER))
      .map((idea) => ({ segment: idea.segment, priority: idea.priority, title: idea.title, description: idea.description, assumptionsToTest: idea.assumptionsToTest ?? [], actionPlan: idea.actionPlan ?? {} }));

    const prompt = `You are writing a concise Business Brief for a founder. Use only the facts supplied below. Do not introduce new customer segments, strategies, metrics, or commitments. Frame uncertainties as assumptions or risks, not facts.

Business title: ${title ?? "Business Model Canvas"}
Business context: ${JSON.stringify(context)}
Current active decisions: ${JSON.stringify(activeIdeas)}

Return valid JSON only:
{
  "summary": "A 2-3 sentence plain-language description of what the business is trying to prove now.",
  "focus": ["Up to 4 current decisions or priorities, stated from the supplied data."],
  "risks": ["Up to 4 concrete assumptions or risks evident in the supplied data."],
  "nextSteps": ["Up to 4 immediate actions taken from supplied action plans or validation methods."]
}`;

    const brief = await generateCanvasSegment(prompt);
    return NextResponse.json({ brief }, { status: 200 });
  } catch (error) {
    console.error("POST /api/business-brief error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export const POST = withAuth(handlePOST);
