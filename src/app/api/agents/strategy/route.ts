import { NextRequest, NextResponse } from "next/server";
import { getIncidentById, getDiagnosisForIncident, insertAuditLog } from "@/services/db";
import { hindsightService } from "@/services/hindsightEngine";
import { openRouterService } from "@/services/openrouter";

export const dynamic = "force-dynamic";

/**
 * POST /api/agents/strategy
 * Determines the safest recovery strategy adhering to allowed-action whitelists.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { incidentId, customConstraints } = body;

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

    let diagnosis = await getDiagnosisForIncident(incident.id);
    if (!diagnosis) {
      // Auto-diagnose if not yet diagnosed
      const relevantMemories = await hindsightService.getRelevantMemories(
        `${incident.title} ${incident.service}`,
        3
      );
      diagnosis = await openRouterService.diagnoseIncident(incident, relevantMemories);
    }

    const hindsightMemories = await hindsightService.getRelevantMemories(
      `${incident.service} ${diagnosis.rootCause}`,
      3
    );

    const strategy = await openRouterService.generateRecoveryStrategy(
      incident,
      diagnosis,
      hindsightMemories,
      customConstraints || [
        "Zero customer downtime",
        "Prefer bulkhead rate-shedding over blind service restart",
      ]
    );

    await insertAuditLog({
      id: `aud-${Date.now()}-strat`,
      incidentId: incident.id,
      eventType: "strategy_generated",
      actor: `OpenRouter AI (${openRouterService.getModelName()})`,
      details: {
        strategy: strategy.strategy,
        primaryAction: strategy.selectedAction,
        risk: strategy.risk,
        confidence: strategy.confidence,
      },
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      data: {
        incidentId: incident.id,
        strategy,
        selectedAction: strategy.selectedAction,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { success: false, error: "Recovery strategy generation failed", details: msg },
      { status: 500 }
    );
  }
}
