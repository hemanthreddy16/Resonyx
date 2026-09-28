import { NextRequest, NextResponse } from "next/server";
import {
  getIncidentById,
  getDiagnosisForIncident,
  updateIncidentStatus,
  insertAuditLog,
} from "@/services/db";
import { hindsightService } from "@/services/hindsightEngine";

export const dynamic = "force-dynamic";

/**
 * POST /api/agents/learn
 * Codifies completed incident, diagnosis, action, and verification into Hindsight Vector Store.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { incidentId, recoveryAction, actionSucceeded = true, importantLessons } = body;

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

    const diagnosis = await getDiagnosisForIncident(incident.id);

    // 1. Store experience into Hindsight Vector Store
    const memoryResponse = await hindsightService.storeIncidentMemory(incident);

    // 2. Store empirical outcome feedback
    await hindsightService.storeOutcome(
      memoryResponse.memoryId,
      actionSucceeded ? "Recovered" : "Mitigated",
      `Autonomous recovery verified via action [${recoveryAction || "isolate_bulkhead"}].`
    );

    // 3. Update organizational learning
    const lesson =
      (importantLessons && importantLessons[0]) ||
      `Action [${recoveryAction || "isolate_bulkhead"}] successfully mitigated ${incident.rootCauseDomain} under peak traffic.`;

    const learningResponse = await hindsightService.updateLearning(
      memoryResponse.memoryId,
      lesson,
      +0.8
    );

    // 4. Update incident status in PostgreSQL
    await updateIncidentStatus(incident.id, "learning-indexed");

    await insertAuditLog({
      id: `aud-${Date.now()}-learn`,
      incidentId: incident.id,
      eventType: "hindsight_learned",
      actor: "Hindsight Evolutionary Knowledge Engine",
      details: {
        memoryId: memoryResponse.memoryId,
        vectorId: memoryResponse.vectorId,
        actionTaken: recoveryAction,
        newConfidence: learningResponse.newConfidence,
        insight: lesson,
        diagnosisRootCause: diagnosis?.rootCause || incident.rootCauseDomain,
      },
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      data: {
        incidentId: incident.id,
        memoryId: memoryResponse.memoryId,
        vectorId: memoryResponse.vectorId,
        learnedInsight: lesson,
        newConfidence: learningResponse.newConfidence,
        status: "learning-indexed",
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { success: false, error: "Hindsight learning codification failed", details: msg },
      { status: 500 }
    );
  }
}
