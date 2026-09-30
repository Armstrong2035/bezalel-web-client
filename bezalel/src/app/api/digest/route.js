import { withAuth } from "@/app/lib/withAuth";
import { NextResponse } from "next/server";
import { getDigestSettings, setDigestPaused, listDigestRuns } from "@/app/lib/services/digestService";
import { listAutomationsForUser } from "@/app/lib/services/automationService";
import { listDocuments } from "@/app/lib/services/documentService";
import { runDailyDigest } from "@/app/lib/services/dailyDigest";

export const runtime = "nodejs";
export const maxDuration = 300;

async function handleGET(request, context, user) {
  try {
    const [settings, automations, documents, runs] = await Promise.all([
      getDigestSettings(user.uid),
      listAutomationsForUser(user.uid),
      listDocuments(user.uid),
      listDigestRuns(user.uid),
    ]);
    return NextResponse.json({ settings, automations, documents, runs });
  } catch (error) {
    return NextResponse.json({ error: "Could not load the digest." }, { status: 500 });
  }
}

async function handlePOST(request, context, user) {
  try {
    const result = await runDailyDigest({ userId: user.uid, force: true });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function handlePATCH(request, context, user) {
  const body = await request.json().catch(() => ({}));
  if (typeof body.paused !== "boolean") {
    return NextResponse.json({ error: "paused is required." }, { status: 400 });
  }
  try {
    const settings = await setDigestPaused(user.uid, body.paused);
    return NextResponse.json({ settings });
  } catch (error) {
    return NextResponse.json({ error: "Could not update the digest." }, { status: 500 });
  }
}

export const GET = withAuth(handleGET);
export const POST = withAuth(handlePOST);
export const PATCH = withAuth(handlePATCH);
