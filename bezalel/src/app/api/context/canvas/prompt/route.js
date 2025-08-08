import { createPrompt } from "@/lib/engines/canvasEngine/canvasSchema";
import { generateCanvasSegment } from "@/lib/services/llmService";
import {
  saveCanvasSegment,
  getUserCanvas,
} from "@/lib/services/canvasSegmentService";

export async function POST(request) {
  try {
    const { context, userId, segment } = await request.json();

    if (!context) {
      return Response.json(
        { error: "context data is required" },
        { status: 400 }
      );
    }
    if (!userId) {
      return Response.json({ error: "userId is required" }, { status: 400 });
    }
    if (!segment) {
      return Response.json({ error: "segment is required" }, { status: 400 });
    }

    // Check if we have a cached response for this segment
    const existingCanvas = await getUserCanvas(userId);
    if (existingCanvas && existingCanvas.segments[segment]) {
      return Response.json({
        canvasId: existingCanvas.id,
        segment: existingCanvas.segments[segment],
        decisions: existingCanvas.decisions,
      });
    }

    // Create the prompt with context and previous decisions
    const prompt = await createPrompt(context, segment, userId);

    // Generate response using LLM
    const response = await generateCanvasSegment(prompt);

    // Save the response to the user's canvas
    const savedCanvas = await saveCanvasSegment(
      userId,
      segment,
      response.response.options
    );

    return Response.json({
      canvasId: savedCanvas.id,
      segment: savedCanvas.segments[segment],
      decisions: savedCanvas.decisions,
    });
  } catch (error) {
    console.error("Error processing prompt request:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
