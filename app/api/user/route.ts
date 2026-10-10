import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { syncUser } from "@/controllers/user.controller";

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await syncUser(
      user.fullName,
      user.primaryEmailAddress?.emailAddress as string
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in sync user route:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
