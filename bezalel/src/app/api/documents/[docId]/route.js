import { NextResponse } from "next/server";
import { updateDocument, deleteDocument } from "@/app/lib/services/documentService";

/**
 * PATCH /api/documents/[docId]
 * Body: { userId, title }
 * Updates the title (or other metadata) of a document.
 */
export async function PATCH(request, { params }) {
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
export async function DELETE(request, { params }) {
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
