import { PreventionView } from "@/features/prevention/PreventionView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Prevention Center & Guardrails | RESONYX",
  description: "Automated CI/CD policy gates and runtime circuit breakers codifying past failures into architectural immunity.",
};

export default function PreventionPage() {
  return <PreventionView />;
}
