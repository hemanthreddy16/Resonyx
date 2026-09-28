import { NextRequest, NextResponse } from "next/server";
import { getIncidentById, insertDiagnosis, insertAuditLog } from "@/services/db";
import { hindsightService } from "@/services/hindsightEngine";
import { openRouterService } from "@/services/openrouter";

export const dynamic = "force-dynamic";

/**
 * POST /api/agents/diagnose
 * Flow: Retrieves relevant Hindsight memory vectors -> sends prompt to OpenRouter -> stores diagnosis in PostgreSQL.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { incidentId } = body;

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

    // Step 2: Hindsight Memory Retrieval
    const query = `${incident.title} ${incident.service} ${incident.rootCauseDomain}`;
    const relevantMemories = await hindsightService.getRelevantMemories(query, 3);

    // Step 3: OpenRouter AI Diagnosis
    const diagnosis = await openRouterService.diagnoseIncident(incident, relevantMemories);

    // Persist diagnosis in PostgreSQL
    const diagnosisId = await insertDiagnosis(incident.id, diagnosis);

    await insertAuditLog({
      id: `aud-${Date.now()}-diag`,
      incidentId: incident.id,
      eventType: "ai_diagnosed",
      actor: `OpenRouter AI (${openRouterService.getModelName()})`,
      details: {
        diagnosisId,
        rootCause: diagnosis.rootCause,
        confidence: diagnosis.confidence,
        recommendedActions: diagnosis.recommendedActions,
      },
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      data: {
        diagnosisId,
        incidentId: incident.id,
        diagnosis,
        retrievedMemoriesCount: relevantMemories.length,
        retrievedMemories: relevantMemories.map((m) => ({
          memoryCode: m.memoryCode,
          source: m.sourceIncident,
          insight: m.learnedInsight,
          outcome: m.outcome,
        })),
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { success: false, error: "AI diagnosis failed", details: msg },
      { status: 500 }
    );
  }
}
