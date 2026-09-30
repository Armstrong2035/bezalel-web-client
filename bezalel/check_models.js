require("dotenv").config({ path: [".env.local", ".env"], quiet: true });

async function main() {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error("DEEPSEEK_API_KEY is not configured.");
  const response = await fetch("https://api.deepseek.com/models", {
    headers: { Authorization: `Bearer ${apiKey}` },
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new Error(`DeepSeek model lookup failed (${response.status}).`);
  const result = await response.json();
  if (!Array.isArray(result.data)) throw new Error("DeepSeek returned an invalid model list.");
  console.log("Available DeepSeek models:");
  for (const model of result.data) console.log(`- ${model.id}`);
  // Explicit opt-in: one small paid generation through the production service.
  if (process.argv.includes("--smoke")) {
    const { generateCanvasSegment } = await import("./src/app/lib/services/llmService.js");
    const output = await generateCanvasSegment('Return exactly this JSON object: {"ok":true}');
    if (output.ok !== true) throw new Error("DeepSeek JSON generation check failed.");
    console.log("Live JSON generation through llmService: passed.");
  }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
