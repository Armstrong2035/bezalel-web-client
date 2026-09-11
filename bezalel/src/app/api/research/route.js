import { NextResponse } from "next/server";
import { researchIdea } from "@/app/lib/services/researchService";
import { saveIdeaResearch } from "@/app/lib/services/documentService";

/**
 * POST /api/research
 *
 * Body: {
 *   userId:           string,
 *   documentId:       string,
 *   ideaId:           string,
 *   idea:             { title: string, description: string },
 *   context:          object   — document business context
 *   documentSnapshot: object   — { title, context, ideas } full canvas state
 *                                for the reasoning chain (optional but recommended)
 * }
 */
export async function POST(request) {
  try {
    const {
      userId,
      documentId,
      ideaId,
      idea,
      context,
      documentSnapshot,
    } = await request.json();

    if (!userId || !documentId || !ideaId) {
      return NextResponse.json(
        { error: "userId, documentId and ideaId are required" },
        { status: 400 }
      );
    }
    if (!idea?.title || !idea?.description) {
      return NextResponse.json(
        { error: "idea.title and idea.description are required" },
        { status: 400 }
      );
    }
    if (!context?.idea?.trim()) {
      return NextResponse.json(
        { error: "Document context is required before running research" },
        { status: 400 }
      );
    }

    console.log(`[research] Starting for ideaId=${ideaId}, title="${idea.title}"`);

    // Pass full document snapshot so reasoning chain can analyse canvas fit
    const research = await researchIdea(idea, context, documentSnapshot ?? null);

    console.log(`[research] Completed. Verdict: ${research.verdict}`);

    await saveIdeaResearch(userId, documentId, ideaId, research);

    // Build reasoning steps for the client ThinkingBlock
    const { buildCanvasReasoning } = await import("@/app/lib/engines/canvasEngine/canvasReasoning");
    let reasoningSteps = [];
    if (documentSnapshot) {
      const { parseReasoningStepsExport } = await import("@/app/api/chat/route");
      // parseReasoningSteps is not exported — rebuild inline for research
      const raw = buildCanvasReasoning(documentSnapshot);
      reasoningSteps = raw
        .split("\n")
        .reduce((acc, line) => {
          const match = line.match(/^STEP\s+\d+\s+[—–-]+\s*(.+)$/);
          if (match) {
            acc.push({ title: line.trim(), body: "" });
          } else if (acc.length > 0) {
            acc[acc.length - 1].body += (acc[acc.length - 1].body ? "\n" : "") + line;
          }
          return acc;
        }, [])
        .map((s) => ({ ...s, body: s.body.trim() }))
        .filter((s) => s.title);
    }

    return NextResponse.json({ research, reasoningSteps }, { status: 200 });
  } catch (error) {
    console.error("POST /api/research error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
