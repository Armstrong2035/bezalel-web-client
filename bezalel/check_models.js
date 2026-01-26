require('dotenv').config();
const https = require('https');

const API_KEY = process.env.GEMINI_API_KEY; // I will pass this env var when running
if (!API_KEY) {
  console.error("Please provide GEMINI_API_KEY env var");
  process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

https.get(url, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      if (json.models) {
        console.log("Available Models:");
        json.models.forEach(model => {
            if (model.name.includes("gemini")) {
                console.log(`- ${model.name}`);
            }
        });
      } else {
        console.log("Response:", json);
      }
    } catch (e) {
      console.error("Error parsing JSON:", e);
      console.log("Raw data:", data);
    }
  });

}).on('error', (err) => {
  console.error("Error fetching models:", err.message);
});
