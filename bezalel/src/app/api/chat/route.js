import { NextResponse } from "next/server";
import { buildCanvasReasoning, buildCanvasSummary } from "@/app/lib/engines/canvasEngine/canvasReasoning";
import { saveChatMessage } from "@/app/lib/services/documentService";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-3.5-flash";
const GEMINI_STREAM_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`;

/**
 * Builds the system prompt — embeds canvas summary + full reasoning chain.
 */
function buildSystemPrompt(documentSnapshot) {
  const summary = buildCanvasSummary(documentSnapshot);
  const reasoning = buildCanvasReasoning(documentSnapshot);

  return `You are a sharp, direct business strategy advisor embedded inside a business model canvas tool called Bezalel.

You are talking with the founder of this business. You have full access to their current canvas state.

${summary}

Your role:
- Help the founder interrogate, stress-test, and improve their canvas
- Surface contradictions, weak links, and missing assumptions they haven't noticed
- Brainstorm alternatives when they're stuck
- Be specific — always reference their actual ideas, not generic advice
- Be concise and direct — founders are busy, cut the filler
- When you spot a problem that spans multiple sections, say so explicitly

DO NOT:
- Give generic startup advice that ignores their specific canvas
- Be sycophantic or pad responses with affirmations
- Repeat the canvas back to them unless they asked

${reasoning}`;
}

/**
 * POST /api/chat  (streaming)
 *
 * Stream protocol:
 *   1. First line: "__REASONING__:" + JSON.stringify({ reasoning, steps }) + "\n"
 *      This is the canvas reasoning chain, sent before any AI text.
 *      The client reads this line, parses it, and strips it from the display stream.
 *   2. Subsequent chunks: raw AI response text, streamed as plain UTF-8.
 *
 * Body: {
 *   userId, documentId,
 *   messages: [{ role, content }],
 *   documentSnapshot: { title, context, ideas }
 * }
 */
export async function POST(request) {
  try {
    const { userId, documentId, messages, documentSnapshot } = await request.json();

    if (!userId || !documentId) {
      return NextResponse.json({ error: "userId and documentId are required" }, { status: 400 });
    }
    if (!messages?.length) {
      return NextResponse.json({ error: "messages array is required" }, { status: 400 });
    }
    if (!documentSnapshot?.context?.idea?.trim()) {
      return NextResponse.json({ error: "Document context is required before chatting" }, { status: 400 });
    }

    // Build reasoning chain — sent to client AND embedded in system prompt
    const reasoningText = buildCanvasReasoning(documentSnapshot);
    const systemPrompt = buildSystemPrompt(documentSnapshot);

    // Parse reasoning into discrete steps for the client UI
    const reasoningSteps = parseReasoningSteps(reasoningText);

    // Gemini contents
    const contents = [
      { role: "user",  parts: [{ text: systemPrompt }] },
      { role: "model", parts: [{ text: "Understood. I have full context of this canvas and I'm ready to help the founder interrogate it." }] },
      ...messages.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
    ];

    const geminiRes = await fetch(GEMINI_STREAM_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents }),
    });

    if (!geminiRes.ok) {
      const err = await geminiRes.json();
      throw new Error(`Gemini error ${geminiRes.status}: ${JSON.stringify(err)}`);
    }

    const encoder = new TextEncoder();
    let fullResponse = "";

    const stream = new ReadableStream({
      async start(controller) {
        // ── Preamble: send reasoning chain before any AI text ──────────
        // Format: single line "__REASONING__:{json}\n"
        // Client must read and strip this before rendering.
        const preamble = `__REASONING__:${JSON.stringify({ steps: reasoningSteps, raw: reasoningText })}\n`;
        controller.enqueue(encoder.encode(preamble));

        // ── Stream Gemini response ──────────────────────────────────────
        const reader = geminiRes.body.getReader();
        const decoder = new TextDecoder();

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (!line.startsWith("data:")) continue;
              const jsonStr = line.slice(5).trim();
              if (!jsonStr || jsonStr === "[DONE]") continue;

              try {
                const event = JSON.parse(jsonStr);
                const text = event.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
                if (text) {
                  fullResponse += text;
                  controller.enqueue(encoder.encode(text));
                }
              } catch {
                // skip malformed SSE lines
              }
            }
          }
        } finally {
          controller.close();
          reader.releaseLock();

          // Persist both turns after stream completes
          if (fullResponse && userId && documentId) {
            const lastUser = [...messages].reverse().find((m) => m.role === "user");
            try {
              if (lastUser) {
                await saveChatMessage(userId, documentId, { role: "user", content: lastUser.content });
              }
              await saveChatMessage(userId, documentId, {
                role: "assistant",
                content: fullResponse,
                // Store reasoning with the message so history shows it too
                reasoning: reasoningSteps,
              });
            } catch (saveErr) {
              console.error("[chat] Failed to save messages:", saveErr);
            }
          }
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("POST /api/chat error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * Parses the raw reasoning chain string into an array of labelled steps.
 * Each step has a { title, body } shape for clean rendering.
 *
 * @param {string} reasoningText
 * @returns {Array<{ title: string, body: string }>}
 */
function parseReasoningSteps(reasoningText) {
  const steps = [];
  // Split on STEP N headers
  const stepRegex = /STEP\s+(\d+)\s+[—–-]+\s*(.+)/g;
  const lines = reasoningText.split("\n");

  let currentStep = null;
  let currentBody = [];

  for (const line of lines) {
    const match = line.match(/^STEP\s+\d+\s+[—–-]+\s*(.+)$/);
    if (match) {
      if (currentStep) {
        steps.push({ title: currentStep, body: currentBody.join("\n").trim() });
      }
      currentStep = line.trim();
      currentBody = [];
    } else if (currentStep) {
      currentBody.push(line);
    }
  }

  if (currentStep) {
    steps.push({ title: currentStep, body: currentBody.join("\n").trim() });
  }

  // Fallback: if regex found nothing, treat whole text as one block
  if (steps.length === 0 && reasoningText.trim()) {
    steps.push({ title: "Canvas Analysis", body: reasoningText.trim() });
  }

  return steps;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const documentId = searchParams.get("documentId");

    if (!userId || !documentId) {
      return NextResponse.json({ error: "userId and documentId are required" }, { status: 400 });
    }

    const { loadChatHistory } = await import("@/app/lib/services/documentService");
    const messages = await loadChatHistory(userId, documentId);
    return NextResponse.json({ messages }, { status: 200 });
  } catch (error) {
    console.error("GET /api/chat error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { userId, documentId } = await request.json();

    if (!userId || !documentId) {
      return NextResponse.json({ error: "userId and documentId are required" }, { status: 400 });
    }

    const { clearChatHistory } = await import("@/app/lib/services/documentService");
    await clearChatHistory(userId, documentId);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/chat error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
