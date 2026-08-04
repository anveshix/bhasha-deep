import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function test() {
  try {
    const history = [
      { role: 'user', parts: [{ text: "Translate 'hello' to French" }] }
    ];
    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-3-flash-preview',
      contents: history,
    });
    for await (const chunk of responseStream) {
      console.log(chunk.text);
    }
  } catch (e) {
    console.error(e);
  }
}
test();
