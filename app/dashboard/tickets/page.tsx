"use client";

import { Ticket, CheckCircle, AlertTriangle, Clock } from "lucide-react";
import { KPICard } from "@/components/dashboard/KPICard";
import { TicketsByStatus } from "@/components/dashboard/TicketsByStatus";
import { TicketsByPriority } from "@/components/dashboard/TicketsByPriority";
import { TicketsTrend } from "@/components/dashboard/TicketsTrend";
import { TicketsByTechnician } from "@/components/dashboard/TicketsByTechnician";
import { TicketsByCategory } from "@/components/dashboard/TicketsByCategory";
import { SLAIndicator } from "@/components/dashboard/SLAIndicator";
import { RecentTicketsList } from "@/components/dashboard/RecentTicketsList";
import { useTicketsAll } from "@/hooks/useTickets";
import { useTicketAnnouncer } from "@/hooks/useTicketAnnouncer";

export default function TicketsPage() {
  const { data, isLoading } = useTicketsAll();

  useTicketAnnouncer(data?.recent);

  return (
    <div className="h-full grid grid-cols-4 grid-rows-[auto_minmax(0,1fr)_minmax(0,1fr)] gap-2 overflow-hidden">
      {/* KPIs - primeira linha, 3 colunas */}
      <div className="col-span-3 grid grid-cols-4 gap-2">
        <KPICard title="Chamados abertos" value={data?.kpis?.totalOpen ?? "-"} icon={Ticket} loading={isLoading} />
        <KPICard title="Fechados no mes" value={data?.kpis?.closedThisMonth ?? "-"} icon={CheckCircle} loading={isLoading} />
        <KPICard title="SLA vencido" value={data?.kpis?.slaOverdue ?? "-"} icon={AlertTriangle} highlight={(data?.kpis?.slaOverdue ?? 0) > 0} loading={isLoading} />
        <KPICard title="Tempo medio resolucao" value={data?.kpis?.avgResolutionHours ? `${data.kpis.avgResolutionHours}h` : "-"} icon={Clock} loading={isLoading} />
      </div>

      {/* Chamados recentes - coluna direita, ocupa todas as linhas */}
      <div className="row-span-3 min-h-0 overflow-hidden">
        <RecentTicketsList data={data?.recent} loading={isLoading} />
      </div>

      {/* Graficos - linha 2 (3 paineis) */}
      <div className="col-span-3 grid grid-cols-3 gap-2 min-h-0 overflow-hidden">
        <TicketsByStatus data={data?.byStatus} loading={isLoading} />
        <TicketsByPriority data={data?.byPriority} loading={isLoading} />
        <SLAIndicator data={data?.byType} loading={isLoading} />
      </div>

      {/* Graficos - linha 3 (3 paineis) */}
      <div className="col-span-3 grid grid-cols-3 gap-2 min-h-0 overflow-hidden">
        <TicketsByTechnician data={data?.byTechnician} loading={isLoading} />
        <TicketsByCategory data={data?.byCategory} loading={isLoading} />
        <TicketsTrend
          data={data?.trend}
          loading={isLoading}
        />
      </div>
    </div>
  );
}
