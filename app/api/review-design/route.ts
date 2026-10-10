import { NextRequest, NextResponse } from "next/server";
import { reviewDesign } from "@/controllers/ai.controller";
import { db } from "@/config/db";
import { ScreenConfigTable } from "@/config/schema";
import { eq, and } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { screenCode, reviewType, projectId, screenId } = await req.json();

    if (!screenCode || !reviewType || !projectId || !screenId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!['ux', 'accessibility', 'cta'].includes(reviewType)) {
      return NextResponse.json({ error: "reviewType must be one of: ux, accessibility, cta" }, { status: 400 });
    }

    const result = await reviewDesign(screenCode, reviewType as 'ux' | 'accessibility' | 'cta');
    
    // Save to database
    await db.update(ScreenConfigTable)
      .set({
        aiReview: {
          type: reviewType,
          result: result
        }
      })
      .where(and(
        eq(ScreenConfigTable.projectId, projectId),
        eq(ScreenConfigTable.screenId, screenId)
      ));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in review-design route:", error);
    return NextResponse.json({ error: "Failed to review design" }, { status: 500 });
  }
}
