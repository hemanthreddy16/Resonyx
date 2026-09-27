import { IncidentSimulatorView } from "@/features/simulator/IncidentSimulatorView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Incident Simulator | RESONYX",
  description: "Interactive operational failure simulator demonstrating real-time Hindsight investigation, pattern correlation, and autonomous failure prevention.",
};

export default function SimulatorPage() {
  return <IncidentSimulatorView />;
}
