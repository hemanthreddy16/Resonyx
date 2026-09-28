import { HindsightView } from "@/features/hindsight/HindsightView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hindsight Memory Bank | RESONYX",
  description: "Remembers organizational failures using Hindsight semantic vector memory and zero-shot pattern matching.",
};

export default function HindsightPage() {
  return <HindsightView />;
}
