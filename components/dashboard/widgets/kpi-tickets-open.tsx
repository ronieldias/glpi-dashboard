"use client";

import { Ticket } from "lucide-react";
import { KPICard } from "@/components/dashboard/KPICard";
import { useTicketsAll } from "@/hooks/useTickets";

export function KPITicketsOpen() {
  const { data, isLoading } = useTicketsAll();
  return <KPICard title="Chamados abertos" value={data?.kpis?.totalOpen ?? "-"} icon={Ticket} loading={isLoading} />;
}
