import Anthropic from "@anthropic-ai/sdk";

// Initialize the Anthropic client
//clearconsole.log("Anthropic API Key:", process.env.ANTHROPIC_API_KEY);

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const generateCanvasSegment = async (prompt) => {
  try {
    const response = await anthropic.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 4000,
      temperature: 0.7,
      system:
        "You are a business strategy expert helping entrepreneurs create detailed business model canvas segments. You MUST respond with valid JSON only, following the exact structure specified in the prompt. Do not include any explanatory text or markdown formatting. The response must be parseable as JSON.",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    // Parse the response text as JSON
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(response.content[0].text);
    } catch (parseError) {
      console.error("Error parsing LLM response as JSON:", parseError);
      throw new Error("Invalid response format from LLM");
    }

    // Validate the response structure
    if (!parsedResponse.segment || !Array.isArray(parsedResponse.options)) {
      throw new Error("Invalid response structure from LLM");
    }

    console.log("\n=== LLM Response ===");
    console.log(JSON.stringify(parsedResponse, null, 2));
    console.log("\n=== Usage ===");
    console.log("Input tokens:", response.usage.input_tokens);
    console.log("Output tokens:", response.usage.output_tokens);
    console.log("==================\n");

    return {
      prompt,
      response: parsedResponse,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
    };
  } catch (error) {
    console.error("Error generating canvas segment:", error);
    throw new Error("Failed to generate canvas segment");
  }
};
