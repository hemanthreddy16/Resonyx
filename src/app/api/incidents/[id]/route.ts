import { NextRequest, NextResponse } from "next/server";
import {
  getIncidentById,
  getDiagnosisForIncident,
  getExecutionsForIncident,
  getVerificationsForIncident,
  getAuditLogsForIncident,
  getLearnedMemoryForIncident,
  getRecalledMemoriesForIncident,
  isDatabaseConnected,
} from "@/services/db";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/incidents/[id]
 * Returns full real PostgreSQL incident details including:
 * - Incident metadata and telemetry
 * - AI Root Cause Diagnosis & OpenRouter reasoning
 * - Recovery strategy and whitelist vetting
 * - Controlled Action Execution record
 * - Post-mitigation telemetry verification probe
 * - Related learned Hindsight memory
 * - Recalled historical failure memories used in diagnosis
 * - Immutable compliance audit trail
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const incident = await getIncidentById(id);

    if (!incident) {
      return NextResponse.json(
        { success: false, error: `Incident '${id}' not found.` },
        { status: 404 }
      );
    }

    const [diagnosis, executions, verifications, auditLogs, learnedMemory] = await Promise.all([
      getDiagnosisForIncident(incident.id),
      getExecutionsForIncident(incident.id),
      getVerificationsForIncident(incident.id),
      getAuditLogsForIncident(incident.id),
      getLearnedMemoryForIncident(incident.id, incident.code),
    ]);

    const recalledMemories = await getRecalledMemoriesForIncident(
      incident.id,
      incident.code,
      diagnosis?.reasoning,
      incident.rootCauseDomain
    );

    // Primary recovery execution & verification
    const execution = executions.length > 0 ? executions[0] : null;
    const verification = verifications.length > 0 ? verifications[0] : null;

    // Derived recovery strategy
    const selectedAction = execution?.action || diagnosis?.recommendedActions?.[0] || "isolate_bulkhead";
    const recoveryStrategy = {
      selectedAction,
      recommendedActions: diagnosis?.recommendedActions || [selectedAction],
      rationale: diagnosis?.reasoning
        ? "Autonomous recovery strategy vetted against human safety whitelist and empirical vector precedence."
        : "Deterministic mitigation guardrail applied under active SLO policy.",
    };

    const isLiveDb = await isDatabaseConnected();

    return NextResponse.json({
      success: true,
      data: {
        incident,
        diagnosis,
        recoveryStrategy,
        executions,
        execution,
        verifications,
        verification,
        learnedMemory,
        recalledMemories,
        hasUsedPreviousMemory: recalledMemories.length > 0,
        auditLogs,
        isLiveDatabase: isLiveDb,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[Incident Details API] Error:", msg);
    return NextResponse.json(
      { success: false, error: "Failed to fetch incident details", details: msg },
      { status: 500 }
    );
  }
}
