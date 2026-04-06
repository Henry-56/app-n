const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

async function test() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("❌ No GEMINI_API_KEY found in .env");
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = "Dime 'Hola Mundo' y responde con un JSON { 'status': 'ok' }. Responde solo el JSON.";

    try {
        console.log("📡 Contactando a Gemini...");
        const result = await model.generateContent(prompt);
        const text = await result.response.text();
        console.log("✅ Respuesta recibida:", text);
    } catch (e) {
        console.error("❌ Error de Gemini:", e.message);
        if (e.response) {
            console.error("Detalles:", JSON.stringify(e.response, null, 2));
        }
    }
}

test();
