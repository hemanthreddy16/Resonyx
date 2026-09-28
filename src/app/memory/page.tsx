import React from "react";
import { MemoryCenterView } from "@/features/memory/MemoryCenterView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Knowledge Center & Neural Memory | RESONYX",
  description: "Real-time failure memory vectors, causal precedent citations, and codified organizational immunity from PostgreSQL.",
};

export default function MemoryPage() {
  return <MemoryCenterView />;
}
