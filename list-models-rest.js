const https = require('https');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("No GEMINI_API_KEY found in .env");
  process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https.get(url, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      if (res.statusCode !== 200) {
        console.error(`Error: ${res.statusCode} ${res.statusMessage}`);
        console.error(data);
        return;
      }

      const response = JSON.parse(data);
      console.log("Available Models:");
      
      const models = response.models || [];
      const generateModels = models.filter(m => m.supportedGenerationMethods.includes("generateContent"));
      
      generateModels.forEach(model => {
        console.log(`- ${model.name.replace('models/', '')} (${model.displayName})`);
      });

      if (generateModels.length === 0) {
        console.log("No models found that support generateContent.");
      }
    } catch (e) {
      console.error("Error parsing response:", e.message);
    }
  });

}).on('error', (err) => {
  console.error("Network error:", err.message);
});
