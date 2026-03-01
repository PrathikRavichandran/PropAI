import { GoogleGenAI } from "@google/genai";

let ai: GoogleGenAI | null = null;

export function getAIClient() {
  if (!ai) {
    // In Vite, process.env.GEMINI_API_KEY is replaced by the define plugin
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (apiKey) {
      ai = new GoogleGenAI({ apiKey });
    } else {
      console.warn("GEMINI_API_KEY is missing. AI features will not work.");
    }
  }
  return ai;
}

export const GEMINI_MODELS = {
  FLASH: 'gemini-3-flash-preview',
  PRO: 'gemini-3.1-pro-preview',
};
