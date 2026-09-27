import { TimelineView } from "@/features/timeline/TimelineView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Learning Timeline | RESONYX",
  description: "Chronological organizational journey from raw operational failures into codified preventative intelligence.",
};

export default function TimelinePage() {
  return <TimelineView />;
}
