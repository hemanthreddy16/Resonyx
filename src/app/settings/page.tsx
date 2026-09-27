import { SettingsView } from "@/features/settings/SettingsView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings & Configuration | RESONYX",
  description: "Enterprise workspace settings, Hindsight vector indexing retention, AI models, and audit logs.",
};

export default function SettingsPage() {
  return <SettingsView />;
}
