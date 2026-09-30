import { DEEPSEEK_URL, getDeepSeekModel } from "./deepseekConfig.mjs";

export async function generateCanvasSegment(prompt) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error("DEEPSEEK_API_KEY is not configured.");
  const response = await fetch(DEEPSEEK_URL, {
    method: "POST",
    signal: AbortSignal.timeout(60_000),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: getDeepSeekModel(),
      messages: [
        {
          role: "system",
          content: "Return only valid JSON. Preserve the exact JSON structure requested by the user.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      thinking: { type: "disabled" },
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`DeepSeek ${response.status}: ${data.error?.message ?? "request failed"}`);
  }

  const responseText = data.choices?.[0]?.message?.content;
  if (data.choices?.[0]?.finish_reason === "length") throw new Error("DeepSeek output was truncated. Please try again.");
  if (!responseText) throw new Error("DeepSeek returned no text output.");
  return JSON.parse(responseText.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim());
}
