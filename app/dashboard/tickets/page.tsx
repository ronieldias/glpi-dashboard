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
    <div className="flex h-full flex-col gap-3">
      {/* KPIs */}
      <div className="grid grid-cols-4 gap-2">
        <KPICard title="Chamados abertos" value={data?.kpis?.totalOpen ?? "-"} icon={Ticket} loading={isLoading} />
        <KPICard title="Fechados no mes" value={data?.kpis?.closedThisMonth ?? "-"} icon={CheckCircle} loading={isLoading} />
        <KPICard title="SLA vencido" value={data?.kpis?.slaOverdue ?? "-"} icon={AlertTriangle} highlight={(data?.kpis?.slaOverdue ?? 0) > 0} loading={isLoading} />
        <KPICard title="Tempo medio resolucao" value={data?.kpis?.avgResolutionHours ? `${data.kpis.avgResolutionHours}h` : "-"} icon={Clock} loading={isLoading} />
      </div>

      {/* Conteudo principal */}
      <div className="flex-1 grid grid-cols-4 gap-2 min-h-0">
        {/* Coluna 1-3: Graficos */}
        <div className="col-span-3 grid grid-cols-3 grid-rows-2 gap-2 min-h-0">
          {/* Linha 1 */}
          <TicketsByStatus data={data?.byStatus} loading={isLoading} />
          <TicketsByPriority data={data?.byPriority} loading={isLoading} />
          <SLAIndicator data={data?.byType} loading={isLoading} />
          {/* Linha 2 */}
          <TicketsByTechnician data={data?.byTechnician} loading={isLoading} />
          <TicketsByCategory data={data?.byCategory} loading={isLoading} />
          <div className="flex flex-col">
            <TicketsTrend
              data7={data?.trend7}
              data30={data?.trend30}
              data90={data?.trend90}
              loading={isLoading}
            />
          </div>
        </div>

        {/* Coluna 4: Lista de chamados recentes */}
        <RecentTicketsList data={data?.recent} loading={isLoading} />
      </div>
    </div>
  );
}
