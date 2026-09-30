import { withAuth } from "@/app/lib/withAuth";
import { NextResponse } from "next/server";
import { listPeopleFromNotion } from "@/app/lib/services/notionService";

export const runtime = "nodejs";

async function handleGET() {
  try {
    const result = await listPeopleFromNotion();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ configured: true, error: error.message, people: [] }, { status: 502 });
  }
}

export const GET = withAuth(handleGET);
