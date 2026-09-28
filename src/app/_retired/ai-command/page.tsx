import { AiCommandView } from "@/features/ai-command/AiCommandView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Command Center | RESONYX",
  description: "Enterprise failure reasoning engine. Query Hindsight vectors, simulate blast radii, and generate automated prevention policies.",
};

export default function AiCommandPage() {
  return <AiCommandView />;
}
