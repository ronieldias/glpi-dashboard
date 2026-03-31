"use client";

import { Clock } from "lucide-react";
import { KPICard } from "@/components/dashboard/KPICard";
import { useTicketsAll } from "@/hooks/useTickets";

export function KPIAvgTime() {
  const { data, isLoading } = useTicketsAll();
  return <KPICard title="Tempo medio" value={data?.kpis?.avgResolutionHours ? `${data.kpis.avgResolutionHours}h` : "-"} icon={Clock} loading={isLoading} />;
}
