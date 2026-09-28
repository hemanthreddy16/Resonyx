import { NextRequest, NextResponse } from "next/server";
import { getAllIncidents, insertIncident } from "@/services/db";
import { Incident } from "@/types";

export const dynamic = "force-dynamic";

/**
 * GET /api/incidents
 * Returns list of operational incidents from PostgreSQL database.
 */
export async function GET() {
  try {
    const incidents = await getAllIncidents();
    return NextResponse.json({
      success: true,
      count: incidents.length,
      data: incidents,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch incidents", details: msg },
      { status: 500 }
    );
  }
}

/**
 * POST /api/incidents
 * Ingests a new failure incident into PostgreSQL.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.title || !body.service) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: title and service are mandatory." },
        { status: 400 }
      );
    }

    const codeNumber = Math.floor(1050 + Math.random() * 500);
    const id = body.id || `inc-${codeNumber}`;
    const code = body.code || `INC-${codeNumber}`;

    const newIncident: Incident = {
      id,
      code,
      title: body.title,
      service: body.service,
      environment: body.environment || "Production",
      severity: body.severity || "high",
      status: body.status || "investigating",
      detectedTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      occurredAt: body.occurredAt || new Date().toISOString(),
      resolvedAt: "In Progress",
      mttrMinutes: 0,
      impactCost: body.impactCost || 120000,
      affectedUsers: body.affectedUsers || 15000,
      rootCauseDomain: body.rootCauseDomain || "Cascading Timeout",
      hindsightVectorId: `vec_${id}_new`,
      similarityMatchCount: 4,
      summary: body.summary || `${body.title} detected on ${body.service}. Telemetry anomaly triggered.`,
      timelineEvents: [
        {
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          description: `Anomaly alert received: ${body.title}`,
          type: "traffic",
        },
      ],
      aiRootCause: {
        likelyCause: body.summary || "Investigation in progress by Resonyx AI Sentinel",
        confidence: 88,
      },
      hindsightRecall: [],
      evidence: body.evidence || {
        metricAnomaly: "Latency elevated p99 > 3,800ms | Connection queue depth > 40",
      },
      keyLearnings: [],
      preventativeMeasures: [],
      tags: body.tags || [body.service, body.severity || "high", "ActiveAlert"],
      riskLevel: body.severity || "high",
    };

    const saved = await insertIncident(newIncident);

    return NextResponse.json({
      success: true,
      message: `Incident ${saved.code} created and persisted to database.`,
      data: saved,
    }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { success: false, error: "Failed to create incident", details: msg },
      { status: 500 }
    );
  }
}
