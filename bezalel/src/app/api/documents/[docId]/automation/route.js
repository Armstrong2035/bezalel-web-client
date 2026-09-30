import { withAuth } from "@/app/lib/withAuth";
import { NextResponse } from "next/server";
import { getAutomation, setAutomationEnabled } from "@/app/lib/services/automationService";
import { getDocument } from "@/app/lib/services/documentService";

export const runtime = "nodejs";

async function handleGET(request, { params }, user) {
  const { docId } = await params;
  try {
    const automation = await getAutomation(user.uid, docId);
    return NextResponse.json({ automation });
  } catch (error) {
    return NextResponse.json({ error: "Could not load automation." }, { status: 500 });
  }
}

async function handlePUT(request, { params }, user) {
  const { docId } = await params;
  const body = await request.json().catch(() => ({}));
  if (typeof body.enabled !== "boolean") {
    return NextResponse.json({ error: "enabled is required." }, { status: 400 });
  }
  try {
    const document = await getDocument(user.uid, docId);
    const automation = await setAutomationEnabled(
      user.uid,
      docId,
      body.enabled,
      document?.title ?? null,
    );
    return NextResponse.json({ automation });
  } catch (error) {
    return NextResponse.json({ error: "Could not save automation." }, { status: 500 });
  }
}

export const GET = withAuth(handleGET);
export const PUT = withAuth(handlePUT);
