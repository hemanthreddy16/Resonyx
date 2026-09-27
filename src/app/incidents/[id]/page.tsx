import React from "react";
import { notFound } from "next/navigation";
import { getIncidentById } from "@/data/mockIncidents";
import { IncidentDetailView } from "@/features/incidents/IncidentDetailView";
import { Metadata } from "next";

interface IncidentDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: IncidentDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const incident = getIncidentById(id);

  if (!incident) {
    return { title: "Incident Not Found | RESONYX" };
  }

  return {
    title: `${incident.code} — ${incident.title} | RESONYX Incident Intelligence`,
    description: incident.summary,
  };
}

export default async function IncidentDetailPage({ params }: IncidentDetailPageProps) {
  const { id } = await params;
  const incident = getIncidentById(id);

  if (!incident) {
    notFound();
  }

  return <IncidentDetailView incident={incident} />;
}
