import { withAuth } from "@/app/lib/withAuth";
import {
  deleteIdeaFromDocument,
  updateIdeaDecision,
  updateIdeaInDocument,
} from "@/app/lib/services/documentService";
import { NextResponse } from "next/server";

/**
 * PATCH /api/update-option
 * Body: { userId, documentId, ideaId, decisionStatus, priority? }
 * Saves an idea's decision state and, for "now" ideas, its execution priority.
 */
async function handlePATCH(request) {
  try {
    const { userId, documentId, ideaId, accepted, decisionStatus, priority } =
      await request.json();

    if (!userId || !documentId || !ideaId) {
      return NextResponse.json(
        { error: "userId, documentId, and ideaId are required." },
        { status: 400 },
      );
    }

    const validStatuses = ["now", "later", "explore", "notPursuing"];
    if (decisionStatus && !validStatuses.includes(decisionStatus)) {
      return NextResponse.json(
        {
          error: "decisionStatus must be now, later, explore, or notPursuing.",
        },
        { status: 400 },
      );
    }

    // Retain support for older clients while cards migrate to decision states.
    const result = decisionStatus
      ? await updateIdeaDecision(
          userId,
          documentId,
          ideaId,
          decisionStatus,
          priority,
        )
      : typeof accepted === "boolean"
        ? await updateIdeaInDocument(userId, documentId, ideaId, accepted)
        : null;

    if (!result) {
      return NextResponse.json(
        { error: "decisionStatus or accepted must be provided." },
        { status: 400 },
      );
    }
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
async function handleDELETE(request) {
  try {
    const { userId, documentId, ideaId } = await request.json();

    if (!userId || !documentId || !ideaId) {
      return NextResponse.json(
        { error: "userId, documentId, and ideaId are required." },
        { status: 400 },
      );
    }

    const result = await deleteIdeaFromDocument(userId, documentId, ideaId);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/update-option error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export const PATCH = withAuth(handlePATCH);

export const DELETE = withAuth(handleDELETE);
