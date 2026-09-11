import { NextResponse } from "next/server";
import { saveDocumentContext, getDocument } from "@/app/lib/services/documentService";

/**
 * GET /api/documents/[docId]/context?userId=xxx
 * Returns the context object stored on a document.
 */
export async function GET(request, { params }) {
  try {
    const { docId } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const doc = await getDocument(userId, docId);
    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    return NextResponse.json({ context: doc.context ?? null }, { status: 200 });
  } catch (error) {
    console.error("GET /api/documents/[docId]/context error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * PUT /api/documents/[docId]/context
 * Body: { userId, context }
 * Saves (replaces) the entire context object for a document.
 */
export async function PUT(request, { params }) {
  try {
    const { docId } = await params;
    const { userId, context } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }
    if (!context || typeof context !== "object") {
      return NextResponse.json({ error: "context must be an object" }, { status: 400 });
    }

    const result = await saveDocumentContext(userId, docId, context);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("PUT /api/documents/[docId]/context error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
