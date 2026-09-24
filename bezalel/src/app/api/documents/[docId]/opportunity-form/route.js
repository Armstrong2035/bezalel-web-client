import { NextResponse } from "next/server";
import { withAuth } from "@/app/lib/withAuth";
import { updateDocument } from "@/app/lib/services/documentService";
import { parseOpportunityForm } from "@/app/lib/opportunityForm.mjs";

async function handlePUT(request, { params }, user) {
  let form;
  try { form = parseOpportunityForm((await request.json()).form); }
  catch { return NextResponse.json({ error: "Invalid opportunity form." }, { status: 400 }); }
  const { docId } = await params;
  try {
    await updateDocument(user.uid, docId, { opportunityForm: form });
    return NextResponse.json({ saved: true });
  } catch (error) {
    return NextResponse.json({ error: "Could not save opportunity form." }, { status: error.code === 5 || error.code === "not-found" ? 404 : 500 });
  }
}

export const PUT = withAuth(handlePUT);
