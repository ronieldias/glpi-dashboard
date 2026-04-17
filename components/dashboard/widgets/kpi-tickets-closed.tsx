"use client";

import { CheckCircle } from "lucide-react";
import { KPICard } from "@/components/dashboard/KPICard";
import { useTicketsAll } from "@/hooks/useTickets";

export function KPITicketsClosed() {
  const { data, isLoading } = useTicketsAll();
  const closedToday = data?.kpis?.closedToday;
  return (
    <KPICard
      title="Fechados no mes"
      value={data?.kpis?.closedThisMonth ?? "-"}
      icon={CheckCircle}
      loading={isLoading}
      delta={
        closedToday !== undefined
          ? { value: closedToday, label: "hoje" }
          : undefined
      }
    />
  );
}
