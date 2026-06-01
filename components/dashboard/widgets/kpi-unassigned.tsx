"use client";

import { Inbox } from "lucide-react";
import { KPICard } from "@/components/dashboard/KPICard";
import { useTicketsAll } from "@/hooks/useTickets";

export function KPIUnassigned() {
  const { data, isLoading } = useTicketsAll();
  const value = data?.kpis?.unassigned;
  const isHigh = typeof value === "number" && value >= 5;
  return (
    <KPICard
      title="Fila órfã"
      value={value ?? "-"}
      icon={Inbox}
      loading={isLoading}
      highlight={isHigh}
      description="sem técnico nem grupo"
    />
  );
}
