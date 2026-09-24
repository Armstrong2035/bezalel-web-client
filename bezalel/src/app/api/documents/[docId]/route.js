import { withAuth } from "@/app/lib/withAuth";
import { NextResponse } from "next/server";
import { updateDocument, deleteDocument, getDocument, getDocumentCanvasIdeas } from "@/app/lib/services/documentService";

async function handleGET(request, { params }) {
  try {
    const { docId } = await params;
    const userId = new URL(request.url).searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "userId is required" }, { status: 400 });
    const [document, ideas] = await Promise.all([
      getDocument(userId, docId),
      getDocumentCanvasIdeas(userId, docId),
    ]);
    if (!document) return NextResponse.json({ error: "Document not found" }, { status: 404 });
    return NextResponse.json({ document, ideas }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("GET document failed:", error);
    return NextResponse.json({ error: "Could not load the saved document. Please retry." }, { status: 500 });
  }
}

/**
 * PATCH /api/documents/[docId]
 * Body: { userId, title }
 * Updates the title (or other metadata) of a document.
 */
async function handlePATCH(request, { params }) {
  try {
    const { docId } = await params;
    const { userId, ...updates } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const result = await updateDocument(userId, docId, updates);
    return NextResponse.json({ document: result }, { status: 200 });
  } catch (error) {
    console.error(`PATCH /api/documents/${params?.docId} error:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * DELETE /api/documents/[docId]
 * Body: { userId }
 * Deletes the document and all its canvasSegments.
 */
async function handleDELETE(request, { params }) {
  try {
    const { docId } = await params;
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    await deleteDocument(userId, docId);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error(`DELETE /api/documents/${params?.docId} error:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export const GET = withAuth(handleGET);

export const PATCH = withAuth(handlePATCH);

export const DELETE = withAuth(handleDELETE);
