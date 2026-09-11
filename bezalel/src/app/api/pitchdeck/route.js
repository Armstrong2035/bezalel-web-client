import { NextResponse } from "next/server";
import { getAllPitchDeckIdeas } from "../../lib/engines/pitchdeckEngine/curateCanvasInfo";

export async function GET() {
  const TEST_USER_ID = "kuvbZ1IzALbrJhePyfCpWXY3SDs2";

  try {
    console.log(`API route: Fetching pitch deck ideas for ${TEST_USER_ID}`);
    const pitchDeckData = await getAllPitchDeckIdeas(TEST_USER_ID);

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
