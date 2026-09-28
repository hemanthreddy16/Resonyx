import { NextRequest, NextResponse } from "next/server";
import { autonomousPipeline } from "@/services/autonomousPipeline";

export const dynamic = "force-dynamic";

/**
 * POST /api/agents/pipeline
 * Executes the entire autonomous recovery loop end-to-end:
 * DETECT -> HINDSIGHT RETRIEVE -> OPENROUTER DIAGNOSE -> PREDICT RISK -> RECOVERY STRATEGY -> POLICY VALIDATE -> RECOVER -> VERIFY -> LEARN
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

    const pipelineResult = await autonomousPipeline.runPipeline(incidentId);

    return NextResponse.json({
      success: pipelineResult.success,
      data: pipelineResult,
    }, { status: pipelineResult.success ? 200 : 500 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { success: false, error: "Autonomous recovery pipeline execution failed", details: msg },
      { status: 500 }
    );
  }
}
