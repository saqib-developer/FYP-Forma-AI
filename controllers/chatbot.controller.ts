import { genAI } from "@/config/google";
import { CHATBOT_SYSTEM_PROMPT } from "@/data/prompt";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function chatWithAssistant(
  history: ChatMessage[],
  message: string
): Promise<string> {
  const genModel = genAI.getGenerativeModel({
    model: "gemini-3.5-flash-lite",
    systemInstruction: CHATBOT_SYSTEM_PROMPT,
  });

  // Gemini's chat history format expects role "model" instead of "assistant",
  // and Gemini requires the history to start with a "user" turn if non-empty.
  const geminiHistory = history
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

  // Trim any leading "model" turn (can happen if the very first UI message
  // was a canned assistant greeting that was accidentally included).
  while (geminiHistory.length > 0 && geminiHistory[0].role === "model") {
    geminiHistory.shift();
  }

  const chat = genModel.startChat({ history: geminiHistory });
  const result = await chat.sendMessage(message);
  return result.response.text();
}