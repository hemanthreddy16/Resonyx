export interface NotificationEvent {
  id: string;
  type: "incident" | "risk" | "pattern" | "prevention";
  title: string;
  message: string;
  timestamp: string;
  severity: "critical" | "high" | "medium" | "low";
}

export class NotificationService {
  static getLiveAlerts(): NotificationEvent[] {
    return [
      {
        id: "alert-01",
        type: "risk",
        title: "Deployment Blast Radius Warning",
        message: "PR #4892 introduces unbounded sync gRPC client matching INC-8942.",
        timestamp: "8m ago",
        severity: "critical",
      },
      {
        id: "alert-02",
        type: "pattern",
        title: "Failure Pattern Crystallized",
        message: "PAT-CASCADING-QUEUE-01 confidence reached 98% with 14 instances.",
        timestamp: "24m ago",
        severity: "high",
      },
    ];
  }
}
