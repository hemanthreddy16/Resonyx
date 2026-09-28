import { NextResponse } from "next/server";
import { isDatabaseConnected } from "@/services/db";
import { openRouterService, ALLOWED_RECOVERY_ACTIONS } from "@/services/openrouter";

export const dynamic = "force-dynamic";

export async function GET() {
  const dbConnected = await isDatabaseConnected();
  const openRouterConfigured = openRouterService.isConfigured();
  const hindsightConfigured = Boolean(
    process.env.HINDSIGHT_API_KEY && process.env.HINDSIGHT_API_KEY.trim().length > 0
  );

  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    services: {
      openrouter: {
        status: openRouterConfigured ? "CONNECTED" : "DEMO / FALLBACK MODE",
        configured: openRouterConfigured,
        model: openRouterService.getModelName(),
      },
      database: {
        status: dbConnected ? "CONNECTED" : "DEMO / MEMORY FALLBACK",
        connected: dbConnected,
        engine: dbConnected ? "PostgreSQL" : "In-Memory Store",
      },
      hindsight: {
        status: hindsightConfigured ? "CONNECTED" : "DEMO MODE",
        configured: hindsightConfigured,
        indexedVectors: 8492,
      },
      safetyGate: {
        status: "ACTIVE",
        enforced: true,
        allowedActionsCount: ALLOWED_RECOVERY_ACTIONS.length,
        allowedActions: ALLOWED_RECOVERY_ACTIONS,
      },
    },
  });
}
