import { RiskDetectionView } from "@/features/risk-detection/RiskDetectionView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pre-Deploy Risk Detection | RESONYX",
  description: "Real-time blast radius radar predicting failures before pull requests and infra changes deploy to production.",
};

export default function RiskDetectionPage() {
  return <RiskDetectionView />;
}
