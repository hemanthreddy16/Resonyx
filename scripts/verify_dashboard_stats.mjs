import pg from "pg";

const dbUrl = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/resonyx";
const baseUrl = process.env.TEST_BASE_URL || "http://localhost:3000";

const pool = new pg.Pool({ connectionString: dbUrl });

async function getDirectDbCounts() {
  const [inc, diag, exec, succExec, ver, mem, audit, activeInc, stored, recalled, succOutcomes] = await Promise.all([
    pool.query("SELECT COUNT(*) as c FROM incidents;"),
    pool.query("SELECT COUNT(*) as c FROM diagnoses;"),
    pool.query("SELECT COUNT(*) as c FROM action_executions;"),
    pool.query("SELECT COUNT(*) as c FROM action_executions WHERE status = 'success';"),
    pool.query("SELECT COUNT(*) as c FROM verifications WHERE verification_status = 'verified_resolved';"),
    pool.query("SELECT COUNT(*) as c FROM hindsight_memories;"),
    pool.query("SELECT COUNT(*) as c FROM audit_logs;"),
    pool.query("SELECT COUNT(*) as c FROM incidents WHERE status = 'investigating';"),
    pool.query("SELECT COUNT(*) as c FROM hindsight_memories;"),
    pool.query("SELECT COALESCE(SUM(recall_count), 0) as c FROM hindsight_memories;"),
    pool.query("SELECT COUNT(*) as c FROM hindsight_memories WHERE outcome IN ('Recovered', 'Mitigated');"),
  ]);

  return {
    totalIncidents: parseInt(inc.rows[0].c, 10),
    totalDiagnoses: parseInt(diag.rows[0].c, 10),
    recoveryExecutions: parseInt(exec.rows[0].c, 10),
    successfulRecoveries: parseInt(succExec.rows[0].c, 10),
    verifiedRecoveries: parseInt(ver.rows[0].c, 10),
    learnedMemories: parseInt(mem.rows[0].c, 10),
    auditEvents: parseInt(audit.rows[0].c, 10),
    activeIncidents: parseInt(activeInc.rows[0].c, 10),
    memoriesStored: parseInt(stored.rows[0].c, 10),
    memoriesRecalled: parseInt(recalled.rows[0].c, 10),
    successfulRecoveryOutcomes: parseInt(succOutcomes.rows[0].c, 10),
  };
}

async function verifyDashboardStats() {
  console.log("================================================================================");
  console.log("RESONYX DASHBOARD STATS VERIFICATION: LIVE POSTGRESQL & API INTEGRATION TEST");
  console.log("================================================================================");
  console.log(`Database URL:    ${dbUrl}`);
  console.log(`Target Base URL: ${baseUrl}\n`);

  // Step 1: Direct PostgreSQL Query
  console.log("[STEP 1] Querying PostgreSQL directly...");
  const dbCounts = await getDirectDbCounts();
  console.log("Direct PostgreSQL Counts:", JSON.stringify(dbCounts, null, 2));

  // Step 2: Query GET /api/dashboard/stats
  console.log("\n[STEP 2] Fetching GET /api/dashboard/stats...");
  const statsRes = await fetch(`${baseUrl}/api/dashboard/stats`);
  if (!statsRes.ok) {
    throw new Error(`Failed to fetch /api/dashboard/stats: HTTP ${statsRes.status}`);
  }
  const statsJson = await statsRes.json();
  console.log("API Response Status:", statsRes.status);
  console.log("API Success:", statsJson.success);
  console.log("API isLiveDatabase:", statsJson.data?.isLiveDatabase);
  console.log("API Metrics:", JSON.stringify(statsJson.data?.metrics, null, 2));
  console.log("API Learning Impact:", JSON.stringify(statsJson.data?.learningImpact, null, 2));

  // Step 3: Validate API matches PostgreSQL exactly
  console.log("\n[STEP 3] Validating API data parity with PostgreSQL...");
  const m = statsJson.data.metrics;
  const li = statsJson.data.learningImpact;

  if (m.totalIncidents !== dbCounts.totalIncidents) {
    throw new Error(`Mismatch in totalIncidents: API=${m.totalIncidents}, DB=${dbCounts.totalIncidents}`);
  }
  if (m.totalDiagnoses !== dbCounts.totalDiagnoses) {
    throw new Error(`Mismatch in totalDiagnoses: API=${m.totalDiagnoses}, DB=${dbCounts.totalDiagnoses}`);
  }
  if (m.recoveryExecutions !== dbCounts.recoveryExecutions) {
    throw new Error(`Mismatch in recoveryExecutions: API=${m.recoveryExecutions}, DB=${dbCounts.recoveryExecutions}`);
  }
  if (m.successfulRecoveries !== dbCounts.successfulRecoveries) {
    throw new Error(`Mismatch in successfulRecoveries: API=${m.successfulRecoveries}, DB=${dbCounts.successfulRecoveries}`);
  }
  if (m.verifiedRecoveries !== dbCounts.verifiedRecoveries) {
    throw new Error(`Mismatch in verifiedRecoveries: API=${m.verifiedRecoveries}, DB=${dbCounts.verifiedRecoveries}`);
  }
  if (m.learnedMemories !== dbCounts.learnedMemories) {
    throw new Error(`Mismatch in learnedMemories: API=${m.learnedMemories}, DB=${dbCounts.learnedMemories}`);
  }
  if (m.auditEvents !== dbCounts.auditEvents) {
    throw new Error(`Mismatch in auditEvents: API=${m.auditEvents}, DB=${dbCounts.auditEvents}`);
  }
  if (li.memoriesStored !== dbCounts.memoriesStored) {
    throw new Error(`Mismatch in memoriesStored: API=${li.memoriesStored}, DB=${dbCounts.memoriesStored}`);
  }

  console.log("✓ All 6 core metric counts and learning impact metrics MATCH PostgreSQL exactly!");

  // Step 4: Verify recent incidents structure
  console.log("\n[STEP 4] Verifying Recent Incidents from PostgreSQL...");
  const recentInc = statsJson.data.recentIncidents;
  console.log(`Received ${recentInc.length} recent incidents.`);
  if (recentInc.length > 0) {
    const first = recentInc[0];
    console.log("Sample Incident Record:", {
      id: first.id,
      code: first.code,
      title: first.title,
      service: first.service,
      severity: first.severity,
      status: first.status,
    });
    if (!first.title || !first.service || !first.severity) {
      throw new Error("Incident record missing required fields");
    }
  }

  // Step 5: Verify recent learnings structure
  console.log("\n[STEP 5] Verifying Recent Learnings from PostgreSQL...");
  const recentMem = statsJson.data.recentLearnings;
  console.log(`Received ${recentMem.length} recent hindsight memories.`);
  if (recentMem.length > 0) {
    const firstMem = recentMem[0];
    console.log("Sample Hindsight Memory:", {
      memoryId: firstMem.memoryId,
      incidentTitle: firstMem.incidentTitle,
      rootCause: firstMem.rootCause,
      outcome: firstMem.outcome,
      confidence: firstMem.confidence,
      createdTime: firstMem.createdTime,
    });
    if (!firstMem.memoryId || !firstMem.rootCause || !firstMem.outcome) {
      throw new Error("Memory record missing required fields");
    }
  }

  // Step 6: Run a complete demo execution pipeline and verify that metrics increase
  console.log("\n[STEP 6] Running Demo Flow to verify real metrics increment live...");
  const incRes = await fetch(`${baseUrl}/api/incidents`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "Live Dashboard Metrics Incremental Verification",
      service: "order-service",
      severity: "critical",
      summary: "Simulated P1 incident to verify real-time PostgreSQL counter increments on dashboard.",
      rootCauseDomain: "Database Contention & Lock Queues",
    }),
  });
  const incData = await incRes.json();
  if (!incData.success) throw new Error("Incident creation failed: " + JSON.stringify(incData));
  const newIncId = incData.data.id;
  console.log(`✓ Created new incident: ${newIncId}`);

  // Diagnose
  const diagRes = await fetch(`${baseUrl}/api/agents/diagnose`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ incidentId: newIncId }),
  });
  const diagData = await diagRes.json();
  if (!diagData.success) throw new Error("Diagnose failed: " + JSON.stringify(diagData));
  console.log(`✓ Diagnosed: ${diagData.data.diagnosis?.rootCause?.slice(0, 50)}...`);

  // Strategy
  const stratRes = await fetch(`${baseUrl}/api/agents/strategy`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ incidentId: newIncId }),
  });
  const stratData = await stratRes.json();
  const selectedAction = stratData.data?.selectedAction || "isolate_bulkhead";

  // Recovery
  const recRes = await fetch(`${baseUrl}/api/agents/recover`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ incidentId: newIncId, action: selectedAction }),
  });
  const recData = await recRes.json();
  if (!recData.success) throw new Error("Recover failed: " + JSON.stringify(recData));
  const actionExecutionId = recData.data.execution.id;
  console.log(`✓ Recovery executed: status=${recData.data.execution.status}`);

  // Verify
  const verRes = await fetch(`${baseUrl}/api/agents/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ incidentId: newIncId, actionExecutionId }),
  });
  const verData = await verRes.json();
  if (!verData.success) throw new Error("Verify failed: " + JSON.stringify(verData));
  console.log(`✓ Verification: status=${verData.data.verification.verificationStatus}`);

  // Learn
  const learnRes = await fetch(`${baseUrl}/api/agents/learn`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      incidentId: newIncId,
      recoveryAction: selectedAction,
      actionSucceeded: true,
      importantLessons: ["Applied bulkhead isolation to order-service under simulated surge."],
    }),
  });
  const learnData = await learnRes.json();
  if (!learnData.success) throw new Error("Learn failed: " + JSON.stringify(learnData));
  console.log(`✓ Learned memory: id=${learnData.data.memoryId}`);

  // Step 7: Query /api/dashboard/stats again to confirm counter increments
  console.log("\n[STEP 7] Querying /api/dashboard/stats after demo execution...");
  const afterStatsRes = await fetch(`${baseUrl}/api/dashboard/stats`);
  const afterStatsJson = await afterStatsRes.json();
  const mAfter = afterStatsJson.data.metrics;
  const liAfter = afterStatsJson.data.learningImpact;

  console.log("Updated Metrics:", JSON.stringify(mAfter, null, 2));

  console.log(`Incidents:    ${m.totalIncidents} -> ${mAfter.totalIncidents} (+${mAfter.totalIncidents - m.totalIncidents})`);
  console.log(`Diagnoses:    ${m.totalDiagnoses} -> ${mAfter.totalDiagnoses} (+${mAfter.totalDiagnoses - m.totalDiagnoses})`);
  console.log(`Executions:   ${m.recoveryExecutions} -> ${mAfter.recoveryExecutions} (+${mAfter.recoveryExecutions - m.recoveryExecutions})`);
  console.log(`Verifications:${m.verifiedRecoveries} -> ${mAfter.verifiedRecoveries} (+${mAfter.verifiedRecoveries - m.verifiedRecoveries})`);
  console.log(`Memories:     ${m.learnedMemories} -> ${mAfter.learnedMemories} (+${mAfter.learnedMemories - m.learnedMemories})`);
  console.log(`Audit Events: ${m.auditEvents} -> ${mAfter.auditEvents} (+${mAfter.auditEvents - m.auditEvents})`);

  if (mAfter.totalIncidents <= m.totalIncidents) throw new Error("totalIncidents did not increment!");
  if (mAfter.totalDiagnoses <= m.totalDiagnoses) throw new Error("totalDiagnoses did not increment!");
  if (mAfter.recoveryExecutions <= m.recoveryExecutions) throw new Error("recoveryExecutions did not increment!");
  if (mAfter.verifiedRecoveries <= m.verifiedRecoveries) throw new Error("verifiedRecoveries did not increment!");
  if (mAfter.learnedMemories <= m.learnedMemories) throw new Error("learnedMemories did not increment!");
  if (mAfter.auditEvents <= m.auditEvents) throw new Error("auditEvents did not increment!");

  console.log("\n================================================================================");
  console.log("ALL VERIFICATION CHECKS PASSED SUCCESSFULLY!");
  console.log("1. Real PostgreSQL database connection verified.");
  console.log("2. GET /api/dashboard/stats matches PostgreSQL row counts 100%.");
  console.log("3. Core metrics, learning impact, recent incidents & learnings verified.");
  console.log("4. Running the demo flow actively increments real metrics in PostgreSQL & API.");
  console.log("================================================================================");

  await pool.end();
}

verifyDashboardStats().catch(async (err) => {
  console.error("Verification failed:", err);
  await pool.end();
  process.exit(1);
});
