import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import {
  createProject,
  getProjectDetail,
  getAllUserProjects,
  updateProject,
} from "@/controllers/project.controller";

export async function POST(request: NextRequest) {
  try {
    const { userInput, device, projectId, theme } = await request.json();
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = user.primaryEmailAddress?.emailAddress as string;
    const { has } = await auth();
    const hasPremium = has({ plan: "pro" });

    const newProject = await createProject(
      projectId as string,
      userInput as string,
      device as string,
      theme as string,
      email,
      hasPremium
    );

    return NextResponse.json(newProject);
  } catch (error) {
    const err = error as Error;
    if (err?.message === "TierLimitReached") {
      return NextResponse.json(
        { error: "Free tier limit reached. Upgrade to Pro for unlimited access." },
        { status: 403 }
      );
    }
    console.error("Create project error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await currentUser();
    const projectId = req.nextUrl.searchParams.get("projectId");

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = user.primaryEmailAddress?.emailAddress as string;

    if (projectId) {
      const details = await getProjectDetail(projectId, email);
      return NextResponse.json(details);
    } else {
      const projects = await getAllUserProjects(email);
      return NextResponse.json(projects);
    }
  } catch (error) {
    console.error("Fetch projects error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { projectName, theme, logo, projectId } = await req.json();

    const updated = await updateProject(
      projectId as string,
      projectName as string | undefined,
      theme as string | undefined,
      logo as string | undefined
    );

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update project error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}