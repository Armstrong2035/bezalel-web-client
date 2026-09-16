import { NextResponse } from "next/server";
import { buildCanvasReasoning, buildCanvasSummary } from "@/app/lib/engines/canvasEngine/canvasReasoning";
import { getChatMemory, saveChatMemory, saveChatMessage } from "@/app/lib/services/documentService";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_MODEL = "deepseek-v4-flash";
const DEEPSEEK_CHAT_URL = "https://api.deepseek.com/chat/completions";

/**
 * Builds the system prompt — embeds canvas summary + full reasoning chain.
 */
function buildSystemPrompt(documentSnapshot, chatMemory) {
  const summary = buildCanvasSummary(documentSnapshot);
  const reasoning = buildCanvasReasoning(documentSnapshot);

  return `You are a sharp, direct business strategy advisor embedded inside a business model canvas tool called Bezalel.

You are talking with the founder of this business. You have full access to their current canvas state.

${summary}

${chatMemory ? `DURABLE CONVERSATION MEMORY:\n${JSON.stringify(chatMemory)}\n\nUse this memory as background context. It records prior decisions and open questions, but the current canvas remains the source of truth.` : ""}

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

  const response = await fetch(DEEPSEEK_CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: DEEPSEEK_MODEL,
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
    if (!DEEPSEEK_API_KEY) {
      return NextResponse.json({ error: "DEEPSEEK_API_KEY is not configured" }, { status: 500 });
    }

    // Build reasoning chain — sent to client AND embedded in system prompt
    const reasoningText = buildCanvasReasoning(documentSnapshot);
    let chatMemory = null;
    try {
      chatMemory = await getChatMemory(userId, documentId);
    } catch (memoryError) {
      // A transient Firestore failure must not make the chat unavailable.
      console.error("[chat] Failed to load memory; continuing without it:", memoryError);
    }
    const systemPrompt = buildSystemPrompt(documentSnapshot, chatMemory);

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

    const deepseekRes = await fetch(DEEPSEEK_CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
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

    const stream = new ReadableStream({
      async start(controller) {
        // ── Preamble: send reasoning chain before any AI text ──────────
        // Format: single line "__REASONING__:{json}\n"
        // Client must read and strip this before rendering.
        const preamble = `__REASONING__:${JSON.stringify({ steps: reasoningSteps, raw: reasoningText })}\n`;
        controller.enqueue(encoder.encode(preamble));

        // ── Stream Gemini response ──────────────────────────────────────
        const reader = deepseekRes.body.getReader();
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
                const text = event.choices?.[0]?.delta?.content ?? "";
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
            try {
              await saveChatMessage(userId, documentId, {
                role: "assistant",
                content: fullResponse,
                // Store reasoning with the message so history shows it too
                reasoning: reasoningSteps,
              });
              const refreshedMemory = await refreshChatMemory(chatMemory, lastUser?.content ?? "", fullResponse);
              await saveChatMemory(userId, documentId, refreshedMemory);
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
