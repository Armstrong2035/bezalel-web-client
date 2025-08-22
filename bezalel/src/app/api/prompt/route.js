import { createPrompt } from "@/app/lib/engines/canvasEngine/canvasSchema";
import { generateCanvasSegment } from "@/app/lib/services/llmService";
import { saveGeneratedIdea } from "@/app/lib/services/canvasSegmentService";

export async function POST(request) {
  try {
    const { context, userId, segment } = await request.json();

    console.log(context, userId, segment);

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

    // Create the prompt with context
    const prompt = await createPrompt(context, segment, userId);
    console.log("prompt sent");

    const llmResponse = await generateCanvasSegment(prompt);
    console.log(llmResponse);

    // Save each generated idea as its own document in Firestore
    const savedIdeas = await Promise.all(
      llmResponse.options.map(async (option) => {
        const ideaData = {
          segment: llmResponse.segment,
          ...option,
        };

        const ideaId = await saveGeneratedIdea(userId, ideaData);

        // Return the saved idea with its Firestore ID
        return {
          id: ideaId,
          ...ideaData,
          accepted: false,
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
