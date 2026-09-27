import { IntegrationsView } from "@/features/integrations/IntegrationsView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Integrations & Ecosystem | RESONYX",
  description: "Connect incident responders, APM telemetry, and CI/CD pipelines to feed the Hindsight failure memory engine.",
};

export default function IntegrationsPage() {
  return <IntegrationsView />;
}
