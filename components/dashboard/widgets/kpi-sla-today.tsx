"use client";

import { ShieldCheck } from "lucide-react";
import { KPICard } from "@/components/dashboard/KPICard";
import { useTicketsAll } from "@/hooks/useTickets";

/**
 * % de tickets resolvidos hoje DENTRO do SLA (solvedate <= time_to_resolve).
 * Comparativo com ontem aparece no delta.
 *
 * null = nenhum ticket resolvido com SLA registrado no período.
 */
export function KPISLAToday() {
  const { data, isLoading } = useTicketsAll();
  const today = data?.kpis?.slaTodayPct;
  const yesterday = data?.kpis?.slaYesterdayPct;
  const isLow = typeof today === "number" && today < 70;

  const value =
    typeof today === "number" ? `${today}%` : today === null ? "—" : "-";

  return (
    <KPICard
      title="SLA cumprido hoje"
      value={value}
      icon={ShieldCheck}
      loading={isLoading}
      highlight={isLow}
      description={
        typeof yesterday === "number" ? `${yesterday}% ontem` : "sem ref. ontem"
      }
    />
  );
}
