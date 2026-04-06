const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

async function list() {
    const apiKey = process.env.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey);
    try {
        const result = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" }).generateContent("test");
        console.log("Gemini 1.5 Flash check:", !!result);
    } catch (e) {
        console.error("Gemini 1.5 Flash failed:", e.message);
    }
}

list();
