import { DEEPSEEK_URL, getDeepSeekModel } from "@/app/lib/services/deepseekConfig.mjs";
import { withAuth } from "@/app/lib/withAuth";
import { NextResponse } from "next/server";
import { buildCanvasReasoning } from "@/app/lib/engines/canvasEngine/canvasReasoning";
import { saveChatMemory, saveChatMessage } from "@/app/lib/services/documentService";
import { readChatEvents } from "@/app/lib/services/readChatEvents.mjs";

import { loadChatContext } from "@/app/lib/services/chatContext";
import { buildChatSystemPrompt } from "@/app/lib/services/chatSystemPrompt";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

async function refreshChatMemory(existingMemory, userMessage, assistantMessage) {
  const prompt = `Create durable memory for a founder's business-canvas conversation. Use only information in the previous memory and the latest exchange. Do not invent facts, recommendations, customer segments, commitments, or metrics. Keep it concise and preserve only information useful in future conversation.

Previous memory: ${JSON.stringify(existingMemory ?? {})}
Latest founder message: ${userMessage}
Latest advisor response: ${assistantMessage}

Return JSON only:
{
  "summary": "2-4 sentences capturing durable context.",
  "decisions": ["confirmed decisions or priorities"],
  "preferences": ["founder constraints or preferences"],
  "openQuestions": ["unresolved questions worth carrying forward"]
}`;

  const response = await fetch(DEEPSEEK_URL, {
    method: "POST",
    signal: AbortSignal.timeout(30_000),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: getDeepSeekModel(),
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      thinking: { type: "disabled" },
    }),
  });

  if (!response.ok) throw new Error("Memory refresh failed");
  const data = await response.json();
  return JSON.parse(data.choices?.[0]?.message?.content ?? "{}");
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
 *   messages: [{ role, content }]
 *   Business context is loaded from the authenticated user's saved document.
 * }
 */
async function handlePOST(request) {
  try {
    const { userId, documentId, messages } = await request.json();

    if (!userId || !documentId) {
      return NextResponse.json({ error: "userId and documentId are required" }, { status: 400 });
    }
    if (!messages?.length) {
      return NextResponse.json({ error: "messages array is required" }, { status: 400 });
    }
    if (!DEEPSEEK_API_KEY) {
      return NextResponse.json({ error: "DEEPSEEK_API_KEY is not configured" }, { status: 500 });
    }

    const saved = await loadChatContext(userId, documentId);
    if (!saved) return NextResponse.json({ error: "Document not found" }, { status: 404 });
    const documentSnapshot = saved.snapshot;
    const chatMemory = saved.memory;
    const reasoningText = buildCanvasReasoning(documentSnapshot);
    const systemPrompt = buildChatSystemPrompt(documentSnapshot, chatMemory, saved.features);

    // Parse reasoning into discrete steps for the client UI
    const reasoningSteps = parseReasoningSteps(reasoningText);
    const lastUser = [...messages].reverse().find((m) => m.role === "user");

    // Persist the founder's turn before generation so a stopped stream or
    // network failure cannot erase what they wrote.
    if (lastUser) {
      try {
        await saveChatMessage(userId, documentId, { role: "user", content: lastUser.content });
      } catch (saveError) {
        // Chat remains usable if the database is temporarily unreachable.
        console.error("[chat] Failed to save the founder's message:", saveError);
      }
    }

    const chatMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((message) => ({
        role: message.role === "assistant" ? "assistant" : "user",
        content: message.content,
      })),
    ];

    const abort = new AbortController();
    const signal = AbortSignal.any([request.signal, abort.signal, AbortSignal.timeout(120_000)]);
    const deepseekRes = await fetch(DEEPSEEK_URL, {
      method: "POST",
      signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: getDeepSeekModel(),
        messages: chatMessages,
        stream: true,
        thinking: { type: "disabled" },
      }),
    });

    if (!deepseekRes.ok) {
      const err = await deepseekRes.json();
      throw new Error(`DeepSeek error ${deepseekRes.status}: ${JSON.stringify(err)}`);
    }

    const encoder = new TextEncoder();
    let fullResponse = "";
    let cancelled = false;

    const stream = new ReadableStream({
      async start(controller) {
        // ── Preamble: send reasoning chain before any AI text ──────────
        // Format: single line "__REASONING__:{json}\n"
        // Client must read and strip this before rendering.
        const preamble = `__REASONING__:${JSON.stringify({ steps: reasoningSteps, raw: reasoningText })}\n`;
        controller.enqueue(encoder.encode(preamble));

        // ── Stream DeepSeek response ──────────────────────────────────────
        let completed = false;
        try {
          for await (const event of readChatEvents(deepseekRes.body)) {
            const text = event.choices?.[0]?.delta?.content ?? "";
            if (text) {
              fullResponse += text;
              if (!cancelled) controller.enqueue(encoder.encode(text));
            }
          }
          completed = true;
        } catch (error) {
          if (!cancelled) controller.error(error);
        } finally {
          if (completed && !cancelled) controller.close();

          // Persist both turns after stream completes
          if (fullResponse && userId && documentId) {
            try {
              await saveChatMessage(userId, documentId, {
                role: "assistant",
                content: fullResponse,
                // Store reasoning with the message so history shows it too
                reasoning: reasoningSteps,
              });
              if (completed && !signal.aborted) {
                const refreshedMemory = await refreshChatMemory(chatMemory, lastUser?.content ?? "", fullResponse);
                await saveChatMemory(userId, documentId, refreshedMemory);
              }
            } catch (saveErr) {
              console.error("[chat] Failed to save messages:", saveErr);
            }
          }
        }
      },
      cancel() { cancelled = true; abort.abort(); },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store, no-transform",
        "X-Accel-Buffering": "no",
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

async function handleGET(request) {
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

async function handleDELETE(request) {
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

export const POST = withAuth(handlePOST);

export const GET = withAuth(handleGET);

export const DELETE = withAuth(handleDELETE);
