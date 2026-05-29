"use client";

import { ShieldAlert } from "lucide-react";
import { KPICard } from "@/components/dashboard/KPICard";
import { useTicketsAll } from "@/hooks/useTickets";

/**
 * Tickets em aberto cujo time_to_resolve vence em < 2h.
 * Janela de ação imediata — não confundir com slaOverdue (já vencido).
 */
export function KPISLACritical() {
  const { data, isLoading } = useTicketsAll();
  const value = data?.kpis?.slaCriticalCount;
  const isCritical = typeof value === "number" && value >= 1;
  return (
    <KPICard
      title="SLA vence em 2h"
      value={value ?? "-"}
      icon={ShieldAlert}
      loading={isLoading}
      highlight={isCritical}
      description={isCritical ? "atender agora" : "janela próxima"}
    />
  );
}
