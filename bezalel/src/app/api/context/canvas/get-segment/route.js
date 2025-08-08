import { getUserCanvasSegments } from "@/lib/services/canvasSegmentService";

export async function POST(request) {
  try {
    const { userId, segment } = await request.json();

    if (!userId) {
      return Response.json({ error: "userId is required" }, { status: 400 });
    }

    if (!segment) {
      return Response.json({ error: "segment is required" }, { status: 400 });
    }

    const segmentData = await getUserCanvasSegments(userId, segment);
    if (!segmentData) {
      return Response.json({ error: "Segment not found" }, { status: 404 });
    }

    return Response.json(segmentData);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
