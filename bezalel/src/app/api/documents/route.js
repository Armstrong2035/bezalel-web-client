import { withAuth } from "@/app/lib/withAuth";
import { NextResponse } from "next/server";
import { createDocument, listDocuments } from "@/app/lib/services/documentService";

/**
 * GET /api/documents?userId=xxx
 * Returns all documents for the given user, newest first.
 */
async function handleGET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const documents = await listDocuments(userId);
    return NextResponse.json({ documents }, { status: 200 });
  } catch (error) {
    console.error("GET /api/documents error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/documents
 * Body: { userId, title? }
 * Creates a new document and returns it.
 */
async function handlePOST(request) {
  try {
    const { userId, title } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const document = await createDocument(userId, { title: title || "Untitled" });
    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    console.error("POST /api/documents error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export const GET = withAuth(handleGET);

export const POST = withAuth(handlePOST);
