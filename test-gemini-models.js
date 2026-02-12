const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");

dotenv.config();

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("No GEMINI_API_KEY found in .env");
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  try {
    // Note: older SDKs might not have listModels directly on genAI, 
    // strictly speaking it's a separate API call, but let's try to just generate content 
    // with a few known candidates if listModels isn't easily accessible via this SDK version 
    // or use the model listing if available. 
    // Actually, the SDK specific method is via the AIConfig or ModelManager if exposed, 
    // but standard usage is just to try models.
    
    // Let's try known variants
    const candidates = [
      "gemini-1.5-flash",
      "gemini-1.5-flash-001",
      "gemini-1.5-flash-latest",
      "gemini-1.5-pro",
      "gemini-1.5-pro-latest",
      "gemini-1.0-pro",
      "gemini-pro"
    ];
    
    console.log("Testing model availability...");
    
    for (const modelName of candidates) {
      try {
        console.log(`Testing ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello, are you there?");
        const response = await result.response;
        console.log(`✅ SUCCESS: ${modelName} is available.`);
        console.log(`Response: ${response.text()}`); 
        return; // Found a working one
      } catch (error) {
        console.log(`❌ FAILED: ${modelName}`);
        console.log(`Error: ${error.message.split('\n')[0]}`);
      }
    }
  } catch (error) {
    console.error("Global error:", error);
  }
}

listModels();
