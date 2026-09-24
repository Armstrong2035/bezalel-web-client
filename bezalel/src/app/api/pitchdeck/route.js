import { withAuth } from "@/app/lib/withAuth";
import { NextResponse } from "next/server";
import { getAllPitchDeckIdeas } from "../../lib/engines/pitchdeckEngine/curateCanvasInfo";

async function handleGET(request, context, user) {

  try {
    const pitchDeckData = await getAllPitchDeckIdeas(user.uid);

    if (pitchDeckData) {
      console.log("API route: Successfully fetched data.");
      return NextResponse.json(pitchDeckData);
    } else {
      console.log("API route: No data returned.");
      return NextResponse.json(
        { error: "Failed to fetch pitch deck ideas" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export const GET = withAuth(handleGET);
