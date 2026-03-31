"use client";

import { CheckCircle } from "lucide-react";
import { KPICard } from "@/components/dashboard/KPICard";
import { useTicketsAll } from "@/hooks/useTickets";

export function KPITicketsClosed() {
  const { data, isLoading } = useTicketsAll();
  return <KPICard title="Fechados no mes" value={data?.kpis?.closedThisMonth ?? "-"} icon={CheckCircle} loading={isLoading} />;
}
