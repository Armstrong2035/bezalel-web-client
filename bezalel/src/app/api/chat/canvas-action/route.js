import { withAuth } from "@/app/lib/withAuth";
import { NextResponse } from "next/server";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_CHAT_URL = "https://api.deepseek.com/chat/completions";

async function handlePOST(request) {
  try {
    const { messages, ideas } = await request.json();

    if (!DEEPSEEK_API_KEY) {
      return NextResponse.json({ error: "DEEPSEEK_API_KEY is not configured" }, { status: 500 });
    }
    if (!Array.isArray(messages) || !Array.isArray(ideas) || ideas.length === 0) {
      return NextResponse.json({ error: "messages and ideas are required" }, { status: 400 });
    }

    const response = await fetch(DEEPSEEK_CHAT_URL, {
      method: "POST",
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(60_000)]),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-v4-flash",
        messages: [
          {
            role: "system",
            content: `You identify one intended business-canvas change from a founder conversation. Match the founder's words to exactly one supplied idea. Infer status changes such as now, later, explore, or notPursuing. Do not invent an idea or change. If the conversation does not clearly request a canvas change, return ideaId null and status null. Return JSON only with this exact shape: {"ideaId": string|null, "status": "now"|"later"|"explore"|"notPursuing"|null, "reason": string}. The reason must be one concise sentence.`,
          },
          {
            role: "user",
            content: `Conversation:\n${JSON.stringify(messages.slice(-12))}\n\nAvailable canvas ideas:\n${JSON.stringify(ideas.map(({ id, title, description, segment, decisionStatus }) => ({ id, title, description, segment, decisionStatus })))}\n\nInfer the requested canvas change.`,
          },
        ],
        response_format: { type: "json_object" },
        thinking: { type: "disabled" },
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Canvas action inference failed (${response.status}): ${body}`);
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content ?? "{}";
    const action = JSON.parse(raw);
    const validStatuses = ["now", "later", "explore", "notPursuing"];
    const matchedIdea = ideas.find((idea) => idea.id === action.ideaId);

    return NextResponse.json({
      ideaId: matchedIdea?.id ?? null,
      status: validStatuses.includes(action.status) ? action.status : null,
      reason: typeof action.reason === "string" ? action.reason : "No clear canvas change found in the conversation.",
    });
  } catch (error) {
    console.error("POST /api/chat/canvas-action error:", error);
    return NextResponse.json({ error: error.message || "Could not infer a canvas change." }, { status: 502 });
  }
}

export const POST = withAuth(handlePOST);
