import { NextRequest, NextResponse } from "next/server";
import { generateFromImage } from "@/controllers/ai.controller";

export async function POST(request: NextRequest) {
  try {
    const { projectId, userInput, device, imageBase64, theme } = await request.json();

    const result = await generateFromImage(
      projectId as string,
      userInput as string,
      device as string,
      imageBase64 as string,
      theme as string
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in generate-from-image route:", error);
    return NextResponse.json({ error: "Failed to generate config from image" }, { status: 500 });
  }
}
