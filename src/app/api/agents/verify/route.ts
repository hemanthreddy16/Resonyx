import { NextRequest, NextResponse } from "next/server";
import {
  getIncidentById,
  insertVerification,
  updateIncidentStatus,
  insertAuditLog,
} from "@/services/db";
import { recoveryActionEngine } from "@/services/recoveryActions";

export const dynamic = "force-dynamic";

/**
 * POST /api/agents/verify
 * Probes telemetry to verify whether the failure is actually resolved post-recovery.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { incidentId, actionExecutionId } = body;

    if (!incidentId) {
      return NextResponse.json(
        { success: false, error: "incidentId is required." },
        { status: 400 }
      );
    }

    const incident = await getIncidentById(incidentId);
    if (!incident) {
      return NextResponse.json(
        { success: false, error: `Incident '${incidentId}' not found.` },
        { status: 404 }
      );
    }

    // Run verification telemetry probe
    const verification = await recoveryActionEngine.verifyRecovery(incident.id, actionExecutionId);

    // Persist verification in PostgreSQL
    await insertVerification(verification);
    console.log(`[Resonyx] verification persisted: incident=${incident.id}, verification=${verification.id}, status=${verification.verificationStatus}`);

    const isResolved = verification.verificationStatus === "verified_resolved";
    if (isResolved) {
      await updateIncidentStatus(incident.id, "resolved", new Date().toISOString());
    }

    await insertAuditLog({
      id: `aud-${Date.now()}-ver`,
      incidentId: incident.id,
      eventType: "recovery_verified",
      actor: "Resonyx Telemetry Prober",
      details: {
        status: verification.verificationStatus,
        result: verification.verificationResult,
        metrics: verification.metrics,
      },
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      data: {
        incidentId: incident.id,
        verification,
        incidentStatus: isResolved ? "resolved" : "mitigated",
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { success: false, error: "Recovery verification failed", details: msg },
      { status: 500 }
    );
  }
}
