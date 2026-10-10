import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
export const genAI = new GoogleGenerativeAI(apiKey!);

export const googleModel = genAI.getGenerativeModel({
  model: "gemini-3.5-flash-lite",
});
