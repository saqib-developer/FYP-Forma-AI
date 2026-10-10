import { NextRequest, NextResponse } from "next/server";
import { generateScreenUI } from "@/controllers/ai.controller";

export async function POST(request: NextRequest) {
  try {
    const { projectId, screenId, screenName, purpose, screenDescription } = await request.json();

    const result = await generateScreenUI(
      projectId as string,
      screenId as string,
      screenName as string,
      purpose as string,
      screenDescription as string
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in generate-screen-ui route:", error);
    return NextResponse.json({ error: "Failed to generate screen UI" }, { status: 500 });
  }
}