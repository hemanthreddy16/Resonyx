import { NextResponse } from "next/server";
import { getMemoryCenterData } from "@/services/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/memories
 * Returns real persistent hindsight memories from PostgreSQL with:
 * - Aggregated memory & learning statistics
 * - Incident relationship (which incident created the memory)
 * - Real diagnosis citations (which incidents recalled this memory during AI diagnosis)
 * - Flags: isNew, isRecalled, isHighConfidence, isSuccessful
 */
export async function GET() {
  try {
    const data = await getMemoryCenterData();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      data,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[Memories API] Error:", msg);
    return NextResponse.json(
      { success: false, error: "Failed to fetch memory center data", details: msg },
      { status: 500 }
    );
  }
}
