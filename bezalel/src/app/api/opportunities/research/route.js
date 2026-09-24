import { withAuth } from "@/app/lib/withAuth";
import { NextResponse } from "next/server";
import { checkRun, runPipeline } from "@/app/lib/services/opportunityPipeline.mjs";

export const runtime = "nodejs";
export const maxDuration = 300;

async function handlePOST(request) {
  const body = await request.json().catch(() => ({}));
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "A research request object is required." }, { status: 400 });
  }
  if (!body.provider && body.action !== "deeper") {
    return NextResponse.json({ error: "This form is out of date. Reload Opportunities to see the Explorium, Bezalel, and Vibe Prospecting choices above the research target. No research was started." }, { status: 400 });
  }
  // The optional deeper action uses the same streamed Bezalel research pipeline.
  if (body.action === "deeper") {
    body.provider = "bezalel";
    body.prompt = `Research only this professional in depth: ${JSON.stringify(body.person)}. ${body.prompt || ""}`;
  }
  try { checkRun(body); }
  catch (error) { return NextResponse.json({ error: error.message }, { status: 400 }); }

  const abort = new AbortController();
  const signal = AbortSignal.any([request.signal, abort.signal, AbortSignal.timeout(270_000)]);
  const encoder = new TextEncoder();
  let closed = false;
  const stream = new ReadableStream({
    async start(controller) {
      const emit = event => { if (!closed) controller.enqueue(encoder.encode(JSON.stringify(event) + "\n")); };
      const heartbeat = setInterval(() => emit({ type: "heartbeat" }), 15000);
      try {
        await runPipeline(body, emit, signal);
      } catch (error) {
        if (!closed) emit({ type: "error", message: signal.aborted ? (signal.reason?.name === "TimeoutError" ? "Research timed out. Completed profiles have been retained." : "Research stopped.") : error.message });
      } finally {
        clearInterval(heartbeat);
        if (!closed) { closed = true; controller.close(); }
      }
    },
    cancel() { closed = true; abort.abort(); },
  });
  return new Response(stream, { headers: {
    "Content-Type": "application/x-ndjson; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    "X-Accel-Buffering": "no",
  } });
}

export const POST = withAuth(handlePOST);
