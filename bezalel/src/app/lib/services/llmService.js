const MODELS = {
  flash: "gemini-3.5-flash",
  pro: "gemini-3.1-pro-preview",
};

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL ?? "deepseek-v4-flash";
const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";

async function generateWithGemini(prompt, modelName) {
  if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured.");
  const modelId = MODELS[modelName];
  if (!modelId) throw new Error(`Invalid Gemini model specified: ${modelName}.`);

  console.log(`Making a live Gemini API call using model: ${modelId}...`);
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      signal: AbortSignal.timeout(60_000),
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" },
      }),
    },
  );

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`Gemini ${response.status}: ${data.error?.message ?? "request failed"}`);
  }

  const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!responseText) throw new Error("Gemini returned no text output.");
  return JSON.parse(responseText);
}

async function generateWithDeepSeek(prompt) {
  if (!DEEPSEEK_API_KEY) throw new Error("DEEPSEEK_API_KEY is not configured.");

  console.log(`Falling back to DeepSeek model: ${DEEPSEEK_MODEL}...`);
  const response = await fetch(DEEPSEEK_URL, {
    method: "POST",
    signal: AbortSignal.timeout(60_000),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: DEEPSEEK_MODEL,
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
  if (!responseText) throw new Error("DeepSeek returned no text output.");
  return JSON.parse(responseText.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim());
}

export async function generateCanvasSegment(prompt, modelName = "flash") {
  try {
    return await generateWithGemini(prompt, modelName);
  } catch (geminiError) {
    console.error("Gemini canvas generation failed; trying DeepSeek fallback:", geminiError);
    try {
      return await generateWithDeepSeek(prompt);
    } catch (deepseekError) {
      console.error("DeepSeek canvas fallback failed:", deepseekError);
      throw new Error(
        `Canvas generation failed. Gemini: ${geminiError.message} DeepSeek: ${deepseekError.message}`,
      );
    }
  }
}
