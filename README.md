# Resonyx: Autonomous Failure Recovery & Organizational Memory Platform

Resonyx is an AI-powered autonomous failure detection, causal diagnosis, recovery strategy, and organizational learning platform built with **Next.js 15**, **React 19**, **PostgreSQL**, **Hindsight Long-Term Memory**, and **OpenRouter**.

---

## 1. Architecture & Autonomous Recovery Flow

```
[ Failure Incident Detected ]
              │
              ▼
[ PostgreSQL Ingestion & Persistent Incident Record ]
              │
              ▼
[ Hindsight Vector Search ] ──> Recalls similar historical postmortems
              │
              ▼
[ OpenRouter AI Diagnosis ] ──> Causal deduction grounded in vector evidence
              │
              ▼
[ Predictive Risk Evaluation ] ──> Blast radius scoring
              │
              ▼
[ Recovery Strategy Generation ] ──> Selects highest-probability mitigation
              │
              ▼
[ Human Safety Gate ] ──> Enforces strict action whitelist (No arbitrary bash/SQL)
              │
              ▼
[ Controlled Action Execution ] ──> Executes safe TypeScript routine with telemetry
              │
              ▼
[ Telemetry Verification Prober ] ──> P99 latency, error rate & connection checks
              │
              ▼
[ Hindsight Learning & Memory Codification ] ──> Stores experience vector in PostgreSQL + Hindsight
```

---

## 2. Environment Variables

Create a `.env.local` file for local development or configure environment variables in your deployment dashboard (e.g. Render, Vercel):

| Variable | Required | Description | Example |
| :--- | :---: | :--- | :--- |
| `DATABASE_URL` | Production | PostgreSQL connection string with SSL support. | `postgresql://user:pass@host:5432/resonyx` |
| `OPENROUTER_API_KEY` | Optional | OpenRouter API Key for server-side LLM inference. | `sk-or-v1-xxxxxxxxxxxx` |
| `OPENROUTER_MODEL` | Optional | Model identifier (Default: `anthropic/claude-3.5-sonnet`). | `anthropic/claude-3.5-sonnet` |
| `HINDSIGHT_API_URL` | Optional | Hindsight REST API cluster endpoint. | `https://api.hindsight.resonyx.io` |
| `HINDSIGHT_API_KEY` | Optional | Hindsight authorization bearer token. | `hs_live_xxxxxxxxxxxx` |
| `NODE_ENV` | Optional | Node environment (`development` or `production`). | `production` |

> **Security Guarantee:** Server-side secrets are never prefixed with `NEXT_PUBLIC_` and are exclusively accessed in server-side API routes and services.

---

## 3. Database Schema & Migration System

Resonyx features a standalone, idempotent migration system. It manages 8 primary relations with foreign keys and query indexes:

1. **`users`**: Operator profiles and SRE team members.
2. **`incidents`**: Full lifecycle incident telemetry, root cause domain, and status.
3. **`diagnoses`**: OpenRouter causal deductions and confidence scores.
4. **`recovery_actions`**: Audited human-safety whitelist registry (9 permitted actions).
5. **`action_executions`**: Execution logs, millisecond durations, and output streams.
6. **`verifications`**: Post-recovery telemetry probing (p99 latency, error rate, CPU).
7. **`audit_logs`**: Immutable compliance event trail for SOC2/ISO27001.
8. **`hindsight_memories`**: Long-term organizational memory vectors, extracted rules, and confidence ratings.

### Running Migrations Manually

Run the migration against the database defined in `DATABASE_URL`:

```bash
npm run db:migrate
```

This script:
- Verifies database connectivity with SSL support (`rejectUnauthorized: false` for cloud providers).
- Executes `src/db/schema.sql` inside a transactional block (`BEGIN; ... COMMIT;`).
- Pre-seeds the 9 whitelisted safety actions.
- Automatically seeds baseline operational incidents and memory records if the tables are empty.
- Prints a verification table of relations and row counts.

---

## 4. Local Setup & Quick Start

1. **Clone the repository**:
   ```bash
   git clone https://github.com/hemanthreddy16/Resonyx.git
   cd Resonyx
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your DATABASE_URL and OPENROUTER_API_KEY
   ```

4. **Run database migration**:
   ```bash
   npm run db:migrate
   ```

5. **Start development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

---

## 5. Render Production Deployment Guide

### Step 1: Create PostgreSQL Database on Render
1. Log in to [dashboard.render.com](https://dashboard.render.com).
2. Click **New +** $\rightarrow$ **PostgreSQL**.
3. Name: `resonyx-db`, Database: `resonyx`, User: `resonyx`.
4. Copy the **Internal Database URL** (e.g. `postgresql://resonyx:xxx@dpg-xxx/resonyx`).

### Step 2: Create Web Service on Render
1. Click **New +** $\rightarrow$ **Web Service**.
2. Connect your repository: `https://github.com/hemanthreddy16/Resonyx`.
3. Configure the following exact settings:
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start` *(This runs `node scripts/migrate.js && next start` to ensure tables are always migrated before traffic is accepted)*
4. Under **Environment Variables**, add:
   - `DATABASE_URL`: *(Paste your Render PostgreSQL connection string)*
   - `OPENROUTER_API_KEY`: *(Your OpenRouter API Key)*
   - `OPENROUTER_MODEL`: `anthropic/claude-3.5-sonnet`
   - `HINDSIGHT_API_URL`: *(Your Hindsight cluster URL, if available)*
   - `HINDSIGHT_API_KEY`: *(Your Hindsight API token, if available)*
   - `NODE_ENV`: `production`

### Step 3: Verify Deployment
Once deployed, check the application health check endpoint:
```bash
curl https://<your-render-service>.onrender.com/api/health
```

Expected JSON response:
```json
{
  "status": "ok",
  "application": "running",
  "services": {
    "database": {
      "status": "connected",
      "connected": true,
      "tableCount": 8
    }
  }
}
```

---

## 6. API Endpoints Reference

| Route | Method | Description |
| :--- | :---: | :--- |
| `/api/health` | `GET` | Production health check (database, Hindsight, OpenRouter, safety gate). |
| `/api/status` | `GET` | Service readiness and configuration summary. |
| `/api/incidents` | `GET` | List operational incidents from PostgreSQL. |
| `/api/incidents` | `POST` | Ingest new failure incident into PostgreSQL. |
| `/api/incidents/[id]` | `GET` | Fetch incident details with correlated diagnosis, executions, and verifications. |
| `/api/agents/diagnose` | `POST` | Grounded AI diagnosis using Hindsight memory vectors + OpenRouter. |
| `/api/agents/strategy` | `POST` | Generates recovery strategy adhering to allowed action whitelist. |
| `/api/agents/recover` | `POST` | Human Safety Gate validation and controlled action execution. |
| `/api/agents/verify` | `POST` | Runs telemetry probing and verifies resolution health metrics. |
| `/api/agents/learn` | `POST` | Codifies postmortem outcome, rule extraction, and confidence weighting into Hindsight. |
| `/api/agents/pipeline` | `POST` | Orchestrates the full 8-stage autonomous recovery loop. |

---

## 7. Human Safety Whitelist

To ensure production safety, Resonyx strictly rejects arbitrary shell commands, scripts, or SQL. Only the 9 whitelisted actions are permitted:

1. `retry_request`
2. `restart_service`
3. `clear_cache`
4. `rollback_deployment`
5. `disable_feature`
6. `escalate_to_human`
7. `isolate_bulkhead`
8. `apply_rate_limit`
9. `cancel_blocking_query`