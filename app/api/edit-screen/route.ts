import { NextRequest, NextResponse } from "next/server";
import { editScreen } from "@/controllers/ai.controller";

export async function POST(req: NextRequest) {
  try {
    const { projectId, screenId, oldCode, userInput } = await req.json();

    const result = await editScreen(
      projectId as string,
      screenId as string,
      oldCode as string,
      userInput as string
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in edit-screen route:", error);
    return NextResponse.json({ error: "Failed to edit screen UI" }, { status: 500 });
  }
}