"use client";

import { AlertTriangle } from "lucide-react";
import { KPICard } from "@/components/dashboard/KPICard";
import { useTicketsAll } from "@/hooks/useTickets";

export function KPISLABreach() {
  const { data, isLoading } = useTicketsAll();
  return <KPICard title="SLA vencido" value={data?.kpis?.slaOverdue ?? "-"} icon={AlertTriangle} highlight={(data?.kpis?.slaOverdue ?? 0) > 0} loading={isLoading} />;
}
