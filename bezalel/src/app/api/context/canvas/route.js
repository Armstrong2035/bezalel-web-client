import {
  getUserCanvas,
  createNewCanvas,
} from "@/lib/services/canvasSegmentService";
import { NextRequest } from "next/server";

//get canvas

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return Response.json({ error: "userId is required" }, { status: 400 });
    }

    const canvas = await getUserCanvas(userId);
    if (!canvas) {
      return Response.json(
        { error: "No canvas found for user" },
        { status: 404 }
      );
    }

    return Response.json(canvas);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

//create canvas

export async function POST(request) {
  try {
    const { userId, canvasName } = await request.json();
    if (!userId) {
      return Response.json({ error: "userId is required" }, { status: 400 });
    }

    const newCanvas = await createNewCanvas(userId, canvasName);
    return Response.json(newCanvas, { status: 201 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
