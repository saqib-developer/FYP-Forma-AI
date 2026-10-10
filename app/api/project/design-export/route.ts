import { NextRequest, NextResponse } from "next/server";
import { exportDesignSystem } from "@/controllers/project.controller";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }

    const tokens = await exportDesignSystem(projectId);
    return NextResponse.json(tokens);
  } catch (error) {
    const err = error as Error;
    console.error("Error exporting design system:", err.message);
    return NextResponse.json({ error: "Failed to export design system" }, { status: 500 });
  }
}
