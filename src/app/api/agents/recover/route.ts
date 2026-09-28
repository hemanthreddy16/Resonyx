import { NextRequest, NextResponse } from "next/server";
import { getIncidentById, insertActionExecution, insertAuditLog } from "@/services/db";
import { recoveryActionEngine } from "@/services/recoveryActions";
import { AllowedRecoveryActionType } from "@/types";

export const dynamic = "force-dynamic";

/**
 * POST /api/agents/recover
 * Human Safety Gate: Enforces action whitelist verification and executes controlled recovery routine.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const incidentId = body.incidentId;
    const action = body.action || body.actionType;

    if (!incidentId || !action) {
      return NextResponse.json(
        { success: false, error: "incidentId and action are required." },
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

    // HUMAN SAFETY VALIDATION: Check against strict whitelist
    if (!recoveryActionEngine.isActionAllowed(action)) {
      await insertAuditLog({
        id: `aud-${Date.now()}-sec`,
        incidentId: incident.id,
        eventType: "human_escalation",
        actor: "Resonyx Human Safety Gate",
        details: { rejectedAction: action, reason: "Action not permitted by policy whitelist." },
        timestamp: new Date().toISOString(),
      });

      return NextResponse.json(
        {
          success: false,
          error: "HUMAN SAFETY GATE INTERCEPTION",
          message: `Action '${action}' is not in the approved recovery whitelist. Arbitrary command execution is strictly blocked.`,
        },
        { status: 403 }
      );
    }

    // Controlled server-side action execution
    const execution = await recoveryActionEngine.executeAction(
      incident.id,
      action as AllowedRecoveryActionType,
      incident.service
    );

    // Record execution in PostgreSQL
    await insertActionExecution(execution);

    return NextResponse.json({
      success: execution.status === "success",
      data: {
        incidentId: incident.id,
        execution,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { success: false, error: "Recovery execution failed", details: msg },
      { status: 500 }
    );
  }
}
