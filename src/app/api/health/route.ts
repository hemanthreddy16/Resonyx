import { NextResponse } from "next/server";
import { db } from "@/services/db";
import { hindsightService } from "@/services/hindsightEngine";
import { openRouterService } from "@/services/openrouter";
import { ALLOWED_RECOVERY_ACTIONS } from "@/types";

export const dynamic = "force-dynamic";

/**
 * GET /api/health
 * Production health check reporting application state, PostgreSQL persistence,
 * Hindsight cluster configuration, and OpenRouter readiness without exposing secrets.
 */
export async function GET() {
  const timestamp = new Date().toISOString();

  // 1. Check PostgreSQL Database Health
  const dbHealth = await db.getDatabaseHealth();

  // 2. Check Hindsight Memory Connection
  const hindsightStatus = hindsightService.getConnectionStatus();
  const hindsightConfigured = hindsightService.isConfigured();

  // 3. Check OpenRouter Configuration
  const openRouterConfigured = openRouterService.isConfigured();
  const openRouterModel = openRouterService.getModelName();

  // Overall system status
  const status = dbHealth.connected
    ? (hindsightConfigured && openRouterConfigured ? "ok" : "degraded")
    : (process.env.NODE_ENV === "production" ? "error" : "degraded");

  const responseBody = {
    status,
    application: "running",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
    timestamp,
    services: {
      database: {
        status: dbHealth.connected ? "connected" : (dbHealth.error ? "error" : "disconnected"),
        connected: dbHealth.connected,
        dialect: dbHealth.dialect,
        tableCount: dbHealth.tableCount,
        records: {
          incidents: dbHealth.incidentCount,
          memories: dbHealth.memoryCount,
          diagnoses: dbHealth.diagnosisCount,
          actionExecutions: dbHealth.actionExecutionCount,
          verifications: dbHealth.verificationCount,
          auditLogs: dbHealth.auditLogCount,
        },
        error: dbHealth.error ? dbHealth.error.substring(0, 100) : undefined,
      },
      hindsight: {
        status: hindsightStatus.status,
        configured: hindsightConfigured,
        storageMode: hindsightConfigured ? "REST API + PostgreSQL" : "PostgreSQL Vector Store",
      },
      openrouter: {
        status: openRouterConfigured ? "configured" : "deterministic-fallback",
        configured: openRouterConfigured,
        model: openRouterModel,
      },
      humanSafetyGate: {
        status: "active",
        enforced: true,
        allowedActionsCount: ALLOWED_RECOVERY_ACTIONS.length,
      },
    },
  };

  const httpStatus = status === "error" ? 503 : 200;
  return NextResponse.json(responseBody, { status: httpStatus });
}
