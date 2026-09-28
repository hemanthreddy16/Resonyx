import { NextResponse } from "next/server";
import { getDashboardStats } from "@/services/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/dashboard/stats
 * Secure server-side endpoint returning live operational statistics from PostgreSQL.
 * Powers the main Resonyx Command Center dashboard.
 */
export async function GET() {
  try {
    const stats = await getDashboardStats();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: stats,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[Dashboard API] Failed to fetch stats:", msg);
    return NextResponse.json(
      { success: false, error: "Failed to fetch dashboard statistics", details: msg },
      { status: 500 }
    );
  }
}
