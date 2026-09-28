import pg from "pg";

const dbUrl = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/resonyx";
const baseUrl = process.env.TEST_BASE_URL || "http://localhost:3005";

const pool = new pg.Pool({ connectionString: dbUrl });

async function getCounts() {
  const tables = [
    "incidents",
    "diagnoses",
    "action_executions",
    "verifications",
    "hindsight_memories",
    "audit_logs",
  ];
  const counts = {};
  for (const t of tables) {
    const res = await pool.query(`SELECT COUNT(*) as count FROM ${t}`);
    counts[t] = parseInt(res.rows[0].count, 10);
  }
  return counts;
}

async function runDemoFlowTest() {
  console.log("=== STARTING LIVE RESONYX 60-SECOND DEMO PERSISTENCE VERIFICATION ===");
  console.log(`Target Base URL: ${baseUrl}`);
  console.log(`Database URL:    ${dbUrl}\n`);

  const initialCounts = await getCounts();
  console.log("Initial Database Row Counts:", initialCounts);

  // STEP 1: UI triggers POST /api/incidents
  console.log("\n--- [STEP 1] Incident Creation ---");
  const incRes = await fetch(`${baseUrl}/api/incidents`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "Payment API Latency Degradation",
      service: "payments-core",
      environment: "Production",
      severity: "critical",
      summary: "Inbound RPS surge (+312%) causing Aurora PostgreSQL connection pool saturation and P99 latency degradation to 4,820ms.",
      rootCauseDomain: "Database Contention & Lock Queues",
      evidence: {
        rps: "14,850 RPS (+312%)",
        cpu: "92.4% CPU saturated",
        latency: "4,820 ms P99 (114x baseline)",
      },
    }),
  });
  const incData = await incRes.json();
  if (!incData.success) throw new Error("Step 1 failed: " + JSON.stringify(incData));
  const incidentId = incData.data.id;
  const incidentCode = incData.data.code;
  console.log(`✓ Incident created: id=${incidentId}, code=${incidentCode}`);

  // STEP 6: AI Diagnosis
  console.log("\n--- [STEP 6] AI Diagnosis (POST /api/agents/diagnose) ---");
  const diagRes = await fetch(`${baseUrl}/api/agents/diagnose`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ incidentId }),
  });
  const diagData = await diagRes.json();
  if (!diagData.success) throw new Error("Step 6 failed: " + JSON.stringify(diagData));
  console.log(`✓ Diagnosis persisted: id=${diagData.data.diagnosisId}, rootCause=${diagData.data.diagnosis?.rootCause}`);

  // STEP 7: Recovery Strategy
  console.log("\n--- [STEP 7] Recovery Strategy (POST /api/agents/strategy) ---");
  const stratRes = await fetch(`${baseUrl}/api/agents/strategy`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ incidentId }),
  });
  const stratData = await stratRes.json();
  if (!stratData.success) throw new Error("Step 7 failed: " + JSON.stringify(stratData));
  const selectedAction = stratData.data.selectedAction || "isolate_bulkhead";
  console.log(`✓ Strategy generated: action=${selectedAction}`);

  // STEP 8: Operator Action / Guardrail Execution
  console.log("\n--- [STEP 8] Recovery Action (POST /api/agents/recover) ---");
  const recRes = await fetch(`${baseUrl}/api/agents/recover`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ incidentId, action: selectedAction }),
  });
  const recData = await recRes.json();
  if (!recData.success) throw new Error("Step 8 failed: " + JSON.stringify(recData));
  const actionExecutionId = recData.data.execution.id;
  console.log(`✓ Recovery action executed & persisted: id=${actionExecutionId}, status=${recData.data.execution.status}`);

  // STEP 9: Outcome Verification
  console.log("\n--- [STEP 9] Telemetry Verification (POST /api/agents/verify) ---");
  const verRes = await fetch(`${baseUrl}/api/agents/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ incidentId, actionExecutionId }),
  });
  const verData = await verRes.json();
  if (!verData.success) throw new Error("Step 9 failed: " + JSON.stringify(verData));
  console.log(`✓ Recovery verified & persisted: id=${verData.data.verification.id}, status=${verData.data.verification.verificationStatus}`);

  // STEP 10: Learning Codification
  console.log("\n--- [STEP 10] Hindsight Learning (POST /api/agents/learn) ---");
  const learnRes = await fetch(`${baseUrl}/api/agents/learn`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      incidentId,
      recoveryAction: selectedAction,
      actionSucceeded: true,
      importantLessons: [
        "Action [isolate_bulkhead] successfully mitigated Aurora database contention under 14,850 RPS surge without customer downtime.",
      ],
    }),
  });
  const learnData = await learnRes.json();
  if (!learnData.success) throw new Error("Step 10 failed: " + JSON.stringify(learnData));
  console.log(`✓ Hindsight learning codified: memoryId=${learnData.data.memoryId}, vectorId=${learnData.data.vectorId}`);

  // HEALTH CHECK
  console.log("\n--- [HEALTH CHECK] /api/health ---");
  const healthRes = await fetch(`${baseUrl}/api/health`);
  const healthData = await healthRes.json();
  console.log("Health Database Records:", healthData.services?.database?.records);

  // FINAL DATABASE VERIFICATION
  console.log("\n=== FINAL DIRECT POSTGRESQL ROW COUNT VERIFICATION ===");
  const finalCounts = await getCounts();
  console.log("Final Database Row Counts:", finalCounts);

  let allIncreased = true;
  for (const table of Object.keys(initialCounts)) {
    const diff = finalCounts[table] - initialCounts[table];
    console.log(`  Table [${table}]: initial=${initialCounts[table]}, final=${finalCounts[table]} (+${diff})`);
    if (diff <= 0) {
      allIncreased = false;
    }
  }

  if (allIncreased) {
    console.log("\n SUCCESS: All 6 tables (incidents, diagnoses, action_executions, verifications, hindsight_memories, audit_logs) successfully persisted live rows!");
  } else {
    console.error("\n FAILURE: One or more tables did not increase!");
    process.exit(1);
  }

  await pool.end();
}

runDemoFlowTest().catch(async (err) => {
  console.error("Test failed:", err);
  await pool.end();
  process.exit(1);
});
