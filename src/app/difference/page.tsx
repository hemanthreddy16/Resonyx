import { HindsightDifferenceView } from "@/features/difference/HindsightDifferenceView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Hindsight Difference | Hackathon Showcase | RESONYX",
  description: "Head-to-head proof why organizational memory turns generic AI into contextual enterprise intelligence.",
};

export default function DifferencePage() {
  return <HindsightDifferenceView />;
}
