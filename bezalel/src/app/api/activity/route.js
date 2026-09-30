import { withAuth } from "@/app/lib/withAuth";
import { NextResponse } from "next/server";
import { listActivities, updateActivityStatus, removeActivity } from "@/app/lib/services/activityService";

export const runtime = "nodejs";

async function handleGET(request, context, user) {
  try {
    const messages = await listActivities(user.uid);
    return NextResponse.json({ messages });
  } catch (error) {
    return NextResponse.json({ error: "Could not load activity." }, { status: 500 });
  }
}

async function handlePATCH(request, context, user) {
  const body = await request.json().catch(() => ({}));
  const { activityId, status } = body;
  if (!activityId || !["read", "unread"].includes(status)) {
    return NextResponse.json({ error: "activityId and status are required." }, { status: 400 });
  }
  try {
    await updateActivityStatus(user.uid, activityId, status);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Could not update the message." }, { status: 500 });
  }
}

async function handleDELETE(request, context, user) {
  const body = await request.json().catch(() => ({}));
  const { activityId } = body;
  if (!activityId) return NextResponse.json({ error: "activityId is required." }, { status: 400 });
  try {
    await removeActivity(user.uid, activityId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Could not dismiss the message." }, { status: 500 });
  }
}

export const GET = withAuth(handleGET);
export const PATCH = withAuth(handlePATCH);
export const DELETE = withAuth(handleDELETE);
