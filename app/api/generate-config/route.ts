import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { generateConfig } from "@/controllers/ai.controller";
import { deleteScreen } from "@/controllers/project.controller";

export async function POST(request: NextRequest) {
  try {
    const { userInput, projectId, device } = await request.json();

    const config = await generateConfig(
      projectId as string,
      userInput as string,
      device as string
    );

    return NextResponse.json(config);
  } catch (error) {
    console.error("Generate config error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const projectId = request.nextUrl.searchParams.get("projectId");
    const screenId = request.nextUrl.searchParams.get("screenId");
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!projectId || !screenId) {
      return NextResponse.json({ error: "Bad Request" }, { status: 400 });
    }

    await deleteScreen(projectId, screenId);

    return NextResponse.json({ message: "Screen deleted successfully" });
  } catch (error) {
    console.error("Error deleting screen:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}