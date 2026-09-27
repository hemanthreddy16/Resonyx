import { IncidentsView } from "@/features/incidents/IncidentsView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Incidents & Postmortems | RESONYX",
  description: "Ingested organizational incident retrospectives, root-cause domain analyses, and failure postmortems.",
};

export default function IncidentsPage() {
  return <IncidentsView />;
}
