import { updateIdeaInDocument } from "@/app/lib/services/documentService";
import { NextResponse } from "next/server";

/**
 * PATCH /api/update-option
 * Body: { userId, documentId, ideaId, accepted }
 * Toggles the accepted status of an idea within a document.
 */
export async function PATCH(request) {
  try {
    const { userId, documentId, ideaId, accepted } = await request.json();

    if (!userId || !documentId || !ideaId) {
      return NextResponse.json(
        { error: "userId, documentId, and ideaId are required." },
        { status: 400 }
      );
    }

    if (typeof accepted !== "boolean") {
      return NextResponse.json(
        { error: "accepted must be a boolean value (true or false)." },
        { status: 400 }
      );
    }

    const result = await updateIdeaInDocument(userId, documentId, ideaId, accepted);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("PATCH /api/update-option error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * DELETE /api/update-option
 * Body: { userId, documentId, ideaId }
 * Permanently deletes a single idea from a document's canvasSegments.
 */
export async function DELETE(request) {
  try {
    const { userId, documentId, ideaId } = await request.json();

    if (!userId || !documentId || !ideaId) {
      return NextResponse.json(
        { error: "userId, documentId, and ideaId are required." },
        { status: 400 }
      );
    }

    const { deleteIdeaFromDocument } = await import("@/app/lib/services/documentService");
    const result = await deleteIdeaFromDocument(userId, documentId, ideaId);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/update-option error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
