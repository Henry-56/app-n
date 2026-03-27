const { GoogleGenerativeAI } = require("@google/generative-ai");

const API_KEY = "AIzaSyBbwHJv0HfHCcfa2sTYCKScx9ZI3ePe0WQ";

async function listModels() {
  const models = ["gemini-1.5-flash-8b", "gemini-1.0-pro", "gemini-pro"];
  for (const m of models) {
      try {
          const genAI = new GoogleGenerativeAI(API_KEY);
          const model = genAI.getGenerativeModel({ model: m });
          await model.generateContent("hi");
          console.log("Model available:", m);
      } catch (e) {
          console.log("Model NOT available:", m, e.message);
      }
  }
}

listModels();
