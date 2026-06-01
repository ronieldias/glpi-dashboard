"use client";

import { RotateCcw } from "lucide-react";
import { KPICard } from "@/components/dashboard/KPICard";
import { useTicketsAll } from "@/hooks/useTickets";

export function KPIReopened() {
  const { data, isLoading } = useTicketsAll();
  const value = data?.kpis?.reopenedThisMonth;
  const isHigh = typeof value === "number" && value >= 5;
  return (
    <KPICard
      title="Reabertos no mês"
      value={value ?? "-"}
      icon={RotateCcw}
      loading={isLoading}
      highlight={isHigh}
      description="sinal de qualidade"
    />
  );
}
