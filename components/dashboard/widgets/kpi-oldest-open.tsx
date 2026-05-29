"use client";

import { Clock } from "lucide-react";
import { KPICard } from "@/components/dashboard/KPICard";
import { useTicketsAll } from "@/hooks/useTickets";

/**
 * Idade (em dias) do ticket aberto há mais tempo. Sinaliza esquecimento.
 * Highlight a partir de 30 dias.
 */
export function KPIOldestOpen() {
  const { data, isLoading } = useTicketsAll();
  const value = data?.kpis?.oldestOpenDays;
  const isCritical = typeof value === "number" && value >= 30;
  return (
    <KPICard
      title="Mais antigo aberto"
      value={value !== undefined ? `${value}d` : "-"}
      icon={Clock}
      loading={isLoading}
      highlight={isCritical}
      description={isCritical ? "ação urgente" : "idade em dias"}
    />
  );
}
