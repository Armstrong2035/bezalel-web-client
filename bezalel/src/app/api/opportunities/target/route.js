import { withAuth } from "@/app/lib/withAuth";
import { NextResponse } from "next/server";
import { exploriumTargetOptions, getExploriumTargetIssues, hasDiscoveryCriteria, normalizeTarget, targetToText } from "@/app/lib/services/exploriumAdapter.mjs";

const API_KEY = process.env.DEEPSEEK_API_KEY;
const URL = "https://api.deepseek.com/chat/completions";

async function handlePOST(request) {
  try {
    const { ideas } = await request.json();
    if (!API_KEY) return NextResponse.json({ error: "DEEPSEEK_API_KEY is not configured" }, { status: 500 });
    if (!Array.isArray(ideas) || ideas.length === 0) return NextResponse.json({ error: "Add at least one Customer Segment or Value Proposition marked Now." }, { status: 400 });

    const response = await fetch(URL, {
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(60_000)]),
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${API_KEY}` },
      body: JSON.stringify({
        model: "deepseek-v4-flash",
        messages: [
          { role: "system", content: "You create a focused people-research target from active business model canvas ideas. Use only supplied ideas; do not invent roles, industries, geographies, company sizes, or attributes. Return JSON only in this exact shape: {\"researchIntent\":\"...\",\"target\":{\"jobTitles\":[],\"jobLevels\":[],\"jobDepartments\":[],\"countries\":[],\"regions\":[],\"companySizes\":[],\"companyRevenues\":[],\"industries\":[],\"skills\":[],\"interests\":[],\"companyNames\":[]}}. Use Explorium-compatible values where the ideas support them. It is valid to leave fields empty." + ` For jobLevels, jobDepartments, companySizes, companyRevenues, and industries, use only exact values from: ${JSON.stringify(exploriumTargetOptions)}. Do not substitute a broader category or revenue range. If the supplied constraint cannot be represented exactly, preserve it in researchIntent for review.` },
          { role: "user", content: `Generate the opportunity target from these active canvas ideas:\n${JSON.stringify(ideas)}` },
        ],
        response_format: { type: "json_object" },
        thinking: { type: "disabled" },
      }),
    });
    if (!response.ok) throw new Error(`Target generation failed (${response.status})`);
    const data = await response.json();
    const result = JSON.parse(data.choices?.[0]?.message?.content ?? "{}");
    const target = normalizeTarget(result.target);
    if (!result.researchIntent || !hasDiscoveryCriteria(target)) throw new Error("The model could not identify a searchable target. Add a specific customer role, company type, or geography to the canvas.");
    return NextResponse.json({ researchIntent: result.researchIntent, target, icp: targetToText(target), targetIssues: getExploriumTargetIssues(target) });
  } catch (error) {
    console.error("POST /api/opportunities/target error:", error);
    return NextResponse.json({ error: error.message || "Could not generate opportunity target." }, { status: 502 });
  }
}

export const POST = withAuth(handlePOST);
