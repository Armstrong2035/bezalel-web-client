import fs from "fs";
import path from "path";

const MODELS = {
  flash: "gemini-2.5-flash-preview-05-20",
  pro: "gemini-2.5-pro-preview-05-20",
};

const API_KEY = process.env.GEMINI_API_KEY;

export const generateCanvasSegment = async (prompt, modelName = "flash") => {
  const localFilePath = path.join(process.cwd(), "llm_response.json");
  //  const useLocalResponse = process.env.USE_LOCAL_LLM_RESPONSE === "true";

  // Check for local file only in development/test environment
  // if (useLocalResponse && fs.existsSync(localFilePath)) {
  //   try {
  //     console.log("Using local LLM response for testing...");
  //     const localResponseText = fs.readFileSync(localFilePath, "utf-8");
  //     return JSON.parse(localResponseText);
  //   } catch (readError) {
  //     console.error("Error reading or parsing local response file:", readError);
  //     // Fall through to make an API call if local file is invalid
  //   }
  // }

  // Live API call logic (this should be the only path in production)
  const modelId = MODELS[modelName];
  if (!modelId) {
    throw new Error(
      `Invalid model specified: ${modelName}. Please choose from "flash" or "pro".`
    );
  }
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent`;

  try {
    const payload = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" },
    };

    console.log(`Making a live Gemini API call using model: ${modelId}...`);

    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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

    const parsedResponse = JSON.parse(responseText);

    // // Save the response to a local file ONLY if in the dev environment
    // if (useLocalResponse) {
    //   console.log("Saving new LLM response to local file...");
    //   fs.writeFileSync(
    //     localFilePath,
    //     JSON.stringify(parsedResponse, null, 2),
    //     "utf-8"
    //   );
    // }

    return parsedResponse;
  } catch (error) {
    console.error("Error generating canvas segment:", error);
    throw new Error("Failed to generate canvas segment from LLM.");
  }
};
