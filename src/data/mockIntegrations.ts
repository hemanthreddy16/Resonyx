import { IntegrationService } from "@/types";

export const MOCK_INTEGRATIONS: IntegrationService[] = [
  {
    id: "int-01",
    name: "PagerDuty Enterprise",
    category: "Incident Management",
    iconName: "PhoneCall",
    status: "connected",
    lastSync: "2 mins ago",
    eventsProcessed: "18,420 post-mortems",
    description: "Ingests incident timelines, on-call escalations, responder chat transcripts, and severity classifications automatically upon incident resolution."
  },
  {
    id: "int-02",
    name: "Datadog APM & Metrics",
    category: "Telemetry",
    iconName: "Activity",
    status: "connected",
    lastSync: "Just now",
    eventsProcessed: "4.2M telemetry events/sec",
    description: "Correlates distributed trace spans, p99 latency regressions, and anomaly telemetry with historical failure signatures."
  },
  {
    id: "int-03",
    name: "GitHub Actions & Enterprise",
    category: "CI/CD & SCM",
    iconName: "GitPullRequest",
    status: "connected",
    lastSync: "3 mins ago",
    eventsProcessed: "1,420 PR scans / day",
    description: "Executes Resonyx Pre-Merge Blast Radius Analysis and blocks commits violating known Hindsight prevention guardrails."
  },
  {
    id: "int-04",
    name: "ServiceNow ITSM",
    category: "Incident Management",
    iconName: "ShieldAlert",
    status: "connected",
    lastSync: "15 mins ago",
    eventsProcessed: "6,920 tickets mapped",
    description: "Syncs Problem Management records, Root Cause Analysis (RCA) documents, and compliance audit trail items."
  },
  {
    id: "int-05",
    name: "Kubernetes & ArgoCD GitOps",
    category: "Cloud Infrastructure",
    iconName: "Boxes",
    status: "connected",
    lastSync: "1 min ago",
    eventsProcessed: "18 clusters monitored",
    description: "Scans Helm chart diffs, deployment rollouts, and configuration drift before synchronization to production clusters."
  },
  {
    id: "int-06",
    name: "AWS CloudWatch & X-Ray",
    category: "Telemetry",
    iconName: "Cloud",
    status: "connected",
    lastSync: "4 mins ago",
    eventsProcessed: "98 AWS accounts linked",
    description: "Monitors cross-account event bridges, DynamoDB throttle spikes, and Lambda concurrency bottlenecks."
  },
  {
    id: "int-07",
    name: "Jira Software & Product Discovery",
    category: "CI/CD & SCM",
    iconName: "CheckSquare",
    status: "available",
    lastSync: "Never",
    eventsProcessed: "0 items",
    description: "Automatically files prioritized technical debt and architectural resilience tickets when recurring anti-patterns are detected."
  },
  {
    id: "int-08",
    name: "Slack Enterprise Grid & Teams",
    category: "Incident Management",
    iconName: "MessageSquare",
    status: "connected",
    lastSync: "Active socket",
    eventsProcessed: "12 incident channels",
    description: "Real-time Resonyx Hindsight Copilot assistant delivering context-aware failure memories directly inside incident command war rooms."
  }
];
