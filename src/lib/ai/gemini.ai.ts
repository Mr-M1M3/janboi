import { config } from "dotenv";
import { GoogleGenAI } from "@google/genai";
config();
const gemini = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});
export default gemini;
