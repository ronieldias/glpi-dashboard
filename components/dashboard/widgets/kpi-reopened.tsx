"use client";

import { RotateCcw } from "lucide-react";
import { KPICard } from "@/components/dashboard/KPICard";
import { useTicketsAll } from "@/hooks/useTickets";

/**
 * Tickets atualmente em aberto que JÁ TINHAM sido resolvidos/fechados no
 * passado (têm solvedate ou closedate setado) — ou seja, foram reabertos.
 * Filtro: solvedate/closedate >= início do mês.
 *
 * Sinaliza qualidade do atendimento: alta taxa = soluções não resolvem.
 */
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
