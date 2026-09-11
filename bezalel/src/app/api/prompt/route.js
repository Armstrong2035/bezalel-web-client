import { createPrompt } from "@/app/lib/engines/canvasEngine/canvasSchema";
import { generateCanvasSegment } from "@/app/lib/services/llmService";
import { getDocumentCanvasIdeas, saveIdeaToDocument } from "@/app/lib/services/documentService";

export async function POST(request) {
  try {
    const { context, userId, documentId, segment } = await request.json();

    if (!context) {
      return Response.json({ error: "context data is required" }, { status: 400 });
    }
    if (!userId) {
      return Response.json({ error: "userId is required" }, { status: 400 });
    }
    if (!documentId) {
      return Response.json({ error: "documentId is required" }, { status: 400 });
    }
    if (!segment) {
      return Response.json({ error: "segment is required" }, { status: 400 });
    }

    // Load accepted decisions from this document so each canvas section builds
    // on the founder's selections instead of inventing a parallel canvas.
    const canvasIdeas = await getDocumentCanvasIdeas(userId, documentId);
    const prompt = await createPrompt(context, segment, userId, canvasIdeas);

    const llmResponse = await generateCanvasSegment(prompt);

    // Save each generated idea under the document's canvasSegments subcollection
    const savedIdeas = await Promise.all(
      llmResponse.options.map(async (option) => {
        const ideaData = {
          segment: llmResponse.segment,
          ...option,
          accepted: false,
        };

        const ideaId = await saveIdeaToDocument(userId, documentId, ideaData);

        return {
          id: ideaId,
          ...ideaData,
        };
      })
    );

    return Response.json({
      success: true,
      ideas: savedIdeas,
      count: savedIdeas.length,
    });
  } catch (error) {
    console.error("Error processing prompt request:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
