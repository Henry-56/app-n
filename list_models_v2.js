const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

async function list() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    try {
        console.log("📡 Fetching models...");
        // In @google/generative-ai SDK 0.24.1, listModels doesn't exist on genAI object?
        // Actually, it's not a common method there. 
        // Let's try gemini-pro and gemini-1.5-flash-latest explicitly.
        const models = ["gemini-1.5-flash", "gemini-pro", "gemini-1.5-flash-latest", "gemini-1.5-pro"];
        for (const m of models) {
            try {
                const model = genAI.getGenerativeModel({ model: m });
                const result = await model.generateContent("test");
                console.log(`✅ Model '${m}' is WORKING!`);
            } catch (e) {
                console.log(`❌ Model '${m}' FAILED: ${e.message}`);
            }
        }
    } catch (e) {
        console.error("List failed:", e.message);
    }
}

list();
