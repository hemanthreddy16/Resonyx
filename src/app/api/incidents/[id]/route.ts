import { NextRequest, NextResponse } from "next/server";
import {
  getIncidentById,
  getDiagnosisForIncident,
  getExecutionsForIncident,
  getVerificationsForIncident,
  getAuditLogsForIncident,
} from "@/services/db";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/incidents/[id]
 * Returns full incident details along with AI diagnosis, executions, verifications, and audit history.
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

    const [diagnosis, executions, verifications, auditLogs] = await Promise.all([
      getDiagnosisForIncident(incident.id),
      getExecutionsForIncident(incident.id),
      getVerificationsForIncident(incident.id),
      getAuditLogsForIncident(incident.id),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        incident,
        diagnosis,
        executions,
        verifications,
        auditLogs,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch incident details", details: msg },
      { status: 500 }
    );
  }
}
