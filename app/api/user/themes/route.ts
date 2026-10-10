import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { UserThemesTable } from "@/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const email = user.primaryEmailAddress?.emailAddress as string;
    
    const themes = await db.select().from(UserThemesTable).where(eq(UserThemesTable.userId, email));
    
    return NextResponse.json(themes);
  } catch (error) {
    console.error("Error fetching themes:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const email = user.primaryEmailAddress?.emailAddress as string;
    
    const { themeName, themeData } = await request.json();

    const newTheme = await db.insert(UserThemesTable).values({
      userId: email,
      themeName,
      themeData,
    }).returning();

    return NextResponse.json(newTheme[0]);
  } catch (error) {
    console.error("Error saving theme:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
