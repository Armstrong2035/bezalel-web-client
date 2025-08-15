import fs from "fs";
import path from "path";

/**
 * Defines the service to interact with the Gemini API for different models.
 */

// Define available models and their base URLs
const MODELS = {
  // Flash is optimized for fast, cost-effective responses for simple tasks.
  flash: "gemini-2.5-flash-preview-05-20",
  // Pro is optimized for complex reasoning and long-form content generation.
  pro: "gemini-2.5-pro-preview-05-20",
};

// Retrieve the API key from environment variables (assuming it's set)
const API_KEY = process.env.GEMINI_API_KEY;

/**
 * Generates a canvas segment using the specified Gemini model.
 * @param {string} prompt The user's prompt.
 * @param {string} modelName The name of the model to use ("flash" or "pro").
 * @returns {Promise<object>} The parsed JSON response from the LLM.
 * @throws {Error} Throws an error if the API call or data parsing fails.
 */
export const generateCanvasSegment = async (prompt, modelName = "flash") => {
  const localFilePath = path.join(process.cwd(), "llm_response.json");

  // Check if a local file exists and the environment variable is set
  if (
    process.env.USE_LOCAL_LLM_RESPONSE === "true" &&
    fs.existsSync(localFilePath)
  ) {
    try {
      console.log("Using local LLM response for testing...");
      const localResponse = JSON.parse(fs.readFileSync(localFilePath, "utf-8"));
      return localResponse;
    } catch (readError) {
      console.error("Error reading or parsing local response file:", readError);
      // Fall through to make an API call if local file is invalid
    }
  }

  // Ensure the requested model is valid
  const modelId = MODELS[modelName];
  if (!modelId) {
    throw new Error(
      `Invalid model specified: ${modelName}. Please choose from "flash" or "pro".`
    );
  }
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent`;

  // --- Gemini API Call
  try {
    const payload = {
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        // Enforcing JSON output with a schema for structured data
        responseMimeType: "application/json",
      },
    };

    console.log(`Making a live Gemini API call using model: ${modelId}...`);

    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `API call failed with status ${response.status}: ${JSON.stringify(
          errorData
        )}`
      );
    }

    const data = await response.json();
    const parsedResponse = JSON.parse(data.candidates[0].content.parts[0].text);

    // Save the new response for future testing
    console.log("Saving new LLM response to local file...");
    fs.writeFileSync(
      localFilePath,
      JSON.stringify(parsedResponse, null, 2),
      "utf-8"
    );

    return parsedResponse;
  } catch (error) {
    console.error("Error generating canvas segment:", error);
    throw new Error("Failed to generate canvas segment from LLM.");
  }
};

// import Anthropic from "@anthropic-ai/sdk";
// import fs from "fs"; // 👈 Import the 'fs' module
// import path from "path"; // 👈 Import the 'path' module for cross-platform compatibility

// const anthropic = new Anthropic({
//   apiKey: process.env.ANTHROPIC_API_KEY,
// });

// export const generateCanvasSegment = async (prompt) => {
//   const localFilePath = path.join(process.cwd(), "llm_response.json");

//   if (
//     process.env.USE_LOCAL_LLM_RESPONSE === "true" &&
//     fs.existsSync(localFilePath)
//   ) {
//     try {
//       console.log("Using local LLM response for testing...");
//       const localResponse = JSON.parse(fs.readFileSync(localFilePath, "utf-8"));
//       return localResponse;
//     } catch (readError) {
//       console.error("Error reading or parsing local response file:", readError);
//       // Fall through to make an API call if local file is invalid
//     }
//   }

//   try {
//     const response = await anthropic.messages.create({
//       model: "claude-sonnet-4-20250514",
//       max_tokens: 4000,
//       temperature: 0.7,
//       system:
//         "You are a business strategy expert helping entrepreneurs create detailed business model canvas segments. You MUST respond with valid JSON only, following the exact structure specified in the prompt. Do not include any explanatory text or markdown formatting. The response must be parseable as JSON.",
//       messages: [{ role: "user", content: prompt }],
//     });

//     let responseText = response.content[0].text;

//     // =================================================================
//     // 👇 NEW: Save the full, raw response to a file for inspection
//     // const logFilePath = path.join(process.cwd(), "llm_response.log");
//     // fs.writeFileSync(logFilePath, responseText, "utf-8");
//     // console.log(`📝 Full LLM response saved to ${logFilePath}`);
//     // =================================================================

//     // Clean the response by looking for markdown fences
//     const jsonMatch = responseText.match(/```json\n([\s\S]*)\n```/);
//     if (jsonMatch && jsonMatch[1]) {
//       responseText = jsonMatch[1];
//     }
//     responseText = responseText.trim();

//     let parsedResponse;
//     try {
//       parsedResponse = JSON.parse(responseText);
//     } catch (parseError) {
//       console.error("Error parsing cleaned LLM response as JSON:", parseError);
//       // Also log the text that failed to parse, even after cleaning
//       console.error("Cleaned text that failed parsing:", responseText);
//       throw new Error("Invalid response format from LLM after cleaning.");
//     }

//     if (!parsedResponse.segment || !Array.isArray(parsedResponse.options)) {
//       throw new Error("Invalid response structure from LLM");
//     }

//     // Your existing logging and return logic...
//     return {
//       prompt,
//       response: parsedResponse,
//       usage: {
//         inputTokens: response.usage.input_tokens,
//         outputTokens: response.usage.output_tokens,
//       },
//     };
//   } catch (error) {
//     console.error("Error in generateCanvasSegment:", error.message);
//     // Re-throw to be caught by the calling API route
//     throw new Error("Failed to generate canvas segment");
//   }
// };
