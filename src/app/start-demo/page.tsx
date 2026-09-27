import { StartDemoView } from "@/features/demo/StartDemoView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "START DEMO (60s Walkthrough) | RESONYX",
  description: "Experience the complete 10-step autonomous organizational failure learning loop in 60 seconds.",
};

export default function StartDemoPage() {
  return <StartDemoView />;
}
