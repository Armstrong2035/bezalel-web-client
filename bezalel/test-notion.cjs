// Zero-provider-cost check of the Notion integration.
// Run from bezalel/:  node test-notion.cjs
// It saves one clearly-named sample person and reads it back, exercising the
// exact notionService code the outreach pipeline uses. No Explorium/OpenAI cost.
const fs = require("node:fs");
const path = require("node:path");
const swc = require("next/dist/build/swc");

require("dotenv").config({ path: path.join(__dirname, ".env") });

async function loadService() {
  const filename = path.join(__dirname, "src", "app", "lib", "services", "notionService.js");
  const result = await swc.transform(fs.readFileSync(filename, "utf8"), {
    filename,
    jsc: { parser: { syntax: "ecmascript", jsx: true }, target: "es2020" },
    module: { type: "commonjs" },
  });
  const module = { exports: {} };
  new Function("require", "module", "exports", result.code)((name) => {
    throw new Error(`notionService.js unexpectedly requires "${name}"`);
  }, module, module.exports);
  return module.exports;
}

async function main() {
  if (!process.env.NOTION_API_KEY) {
    console.error("NOTION_API_KEY is not set. Add it to bezalel/.env first.");
    process.exit(1);
  }

  const { savePersonToNotion, listPeopleFromNotion } = await loadService();

  const sample = {
    provider: "bezalel",
    name: "Notion Pipeline Test",
    role: "QA Engineer at Test Co",
    summary: "A sample person used to verify the Notion pipeline end to end.",
    signal: "Posted about continuous integration.",
    hook: "Ask about their CI setup.",
    fit: "Strong ICP match for testing.",
    sources: ["https://example.com/profile"],
    score: 87,
  };

  console.log("1/2 Saving sample person to Notion…");
  const saved = await savePersonToNotion(sample);
  if (saved?.skipped) {
    console.error("Save was skipped. Is NOTION_API_KEY set correctly?");
    process.exit(1);
  }
  console.log("   Saved. Page id:", saved.id);

  console.log("2/2 Reading back from Notion…");
  const list = await listPeopleFromNotion();
  console.log(`   Found ${list.people.length} people in the database.`);
  const mine = list.people.filter((p) => p.name === sample.name);
  console.log("   Sample person present:", mine.length > 0 ? "YES" : "NO");
  if (mine.length) console.log(JSON.stringify(mine[0], null, 2));

  process.exit(mine.length > 0 ? 0 : 1);
}

main().catch((error) => {
  console.error("Notion check failed:", error.message);
  process.exit(1);
});
