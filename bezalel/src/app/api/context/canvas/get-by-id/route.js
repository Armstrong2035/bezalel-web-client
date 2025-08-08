import { getCanvasSegment } from "@/lib/services/canvasSegmentService";

export async function POST(request) {
  try {
    const { canvasId } = await request.json();

    if (!canvasId) {
      return Response.json({ error: "canvasId is required" }, { status: 400 });
    }

    const canvas = await getCanvasSegment(canvasId);
    return Response.json(canvas);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
