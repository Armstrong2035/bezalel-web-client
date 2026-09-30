import { NextResponse } from "next/server";
import { runDailyDigest } from "@/app/lib/services/dailyDigest";

export const runtime = "nodejs";
export const maxDuration = 300;

// The cron trigger is not a signed-in user; it is authenticated with a shared
// secret instead. Vercel Cron cannot send custom headers, so a `vercel-cron`
// User-Agent is accepted, and CRON_SECRET is verified for manual/other triggers.
function authorized(request) {
  const userAgent = request.headers.get("user-agent") || "";
  if (userAgent.startsWith("vercel-cron")) return true;
  if (!process.env.CRON_SECRET) return true;
  if (request.headers.get("authorization") === `Bearer ${process.env.CRON_SECRET}`) return true;
  return new URL(request.url).searchParams.get("secret") === process.env.CRON_SECRET;
}

async function handle() {
  try {
    const result = await runDailyDigest();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return handle();
}

export const POST = GET;
