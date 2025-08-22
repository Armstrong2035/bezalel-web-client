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
      // Correctly read and parse the JSON string from the local file
      const localResponseText = fs.readFileSync(localFilePath, "utf-8");
      return JSON.parse(localResponseText);
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
    const responseText = data.candidates[0].content.parts[0].text;

    // Log the raw text to see what the LLM is actually sending
    console.log("Raw LLM response text:", responseText);

    // ✅ FIX: Correctly parse the JSON string into a JavaScript object
    const parsedResponse = JSON.parse(responseText);

    // Save the new response for future testing
    console.log("Saving new LLM response to local file...");
    // ✅ FIX: Correctly stringify the parsed object before saving
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
