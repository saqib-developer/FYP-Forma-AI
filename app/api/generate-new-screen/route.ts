import { NextRequest, NextResponse } from "next/server";
import { generateNewScreen } from "@/controllers/ai.controller";

export async function POST(request: NextRequest) {
  try {
    const { projectId, userInput } = await request.json();

    const result = await generateNewScreen(
      projectId as string,
      userInput as string
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in generate-new-screen route:", error);
    return NextResponse.json({ error: "Failed to generate new screen config" }, { status: 500 });
  }
}
