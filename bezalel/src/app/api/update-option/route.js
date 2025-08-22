import { updateIdeaStatus } from "@/app/lib/services/canvasSegmentService";
import { NextResponse } from "next/server";

export async function PATCH(request) {
  try {
    const { userId, ideaId, accepted } = await request.json();
    the;
    // Check for required fields
    if (!userId || !ideaId) {
      return NextResponse.json(
        { error: "userId and ideaId are required." },
        { status: 400 }
      );
    }

    // Validate the accepted status
    if (typeof accepted !== "boolean") {
      return NextResponse.json(
        { error: "Status must be a boolean value (true or false)." },
        { status: 400 }
      );
    }

    // Call the service function with the correct arguments
    const result = await updateIdeaStatus(userId, ideaId, accepted);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
