import { PatternsView } from "@/features/patterns/PatternsView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pattern Intelligence | RESONYX",
  description: "Discovers recurring failure signatures, anti-patterns, and cascading blast radii from historical outcomes.",
};

export default function PatternsPage() {
  return <PatternsView />;
}
