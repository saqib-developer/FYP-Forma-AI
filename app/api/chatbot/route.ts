import { NextRequest, NextResponse } from "next/server";
import { chatWithAssistant, ChatMessage } from "@/controllers/chatbot.controller";

export async function POST(request: NextRequest) {
  try {
    const { history, message } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const reply = await chatWithAssistant(
      (history || []) as ChatMessage[],
      message
    );

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Error in chatbot route:", error);
    return NextResponse.json(
      { error: "Failed to get a response from the assistant" },
      { status: 500 }
    );
  }
}