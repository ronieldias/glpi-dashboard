"use client";

import { Ticket, CheckCircle, Clock, FolderKanban, FolderCheck, CalendarClock, ListTodo } from "lucide-react";
import { KPICard } from "@/components/dashboard/KPICard";
import { TicketsByStatus } from "@/components/dashboard/TicketsByStatus";
import { TicketsTrend } from "@/components/dashboard/TicketsTrend";
import { ProjectsByStatus } from "@/components/dashboard/ProjectsByStatus";
import { ProjectProgress } from "@/components/dashboard/ProjectProgress";
import { RecentTicketsList } from "@/components/dashboard/RecentTicketsList";
import { useTicketsAll } from "@/hooks/useTickets";
import { useProjectsAll } from "@/hooks/useProjects";
import { useTicketAnnouncer } from "@/hooks/useTicketAnnouncer";

export default function OverviewPage() {
  const { data: ticketsData, isLoading: ticketsLoading } = useTicketsAll();
  const { data: projectsData, isLoading: projectsLoading } = useProjectsAll();

  useTicketAnnouncer(ticketsData?.recent);

  return (
    <div className="h-full grid grid-cols-4 grid-rows-[auto_minmax(0,1fr)_minmax(0,1fr)] gap-2 overflow-hidden">
      {/* KPIs - primeira linha, 3 colunas */}
      <div className="col-span-3 grid grid-cols-7 gap-2">
        <KPICard title="Chamados abertos" value={ticketsData?.kpis?.totalOpen ?? "-"} icon={Ticket} loading={ticketsLoading} />
        <KPICard title="Fechados no mes" value={ticketsData?.kpis?.closedThisMonth ?? "-"} icon={CheckCircle} loading={ticketsLoading} />
        <KPICard title="Tempo medio" value={ticketsData?.kpis?.avgResolutionHours ? `${ticketsData.kpis.avgResolutionHours}h` : "-"} icon={Clock} loading={ticketsLoading} />
        <KPICard title="Projetos ativos" value={projectsData?.kpis?.activeProjects ?? "-"} icon={FolderKanban} loading={projectsLoading} />
        <KPICard title="Concluidos ano" value={projectsData?.kpis?.completedThisYear ?? "-"} icon={FolderCheck} loading={projectsLoading} />
        <KPICard title="Prazo vencido" value={projectsData?.kpis?.overdueProjects ?? "-"} icon={CalendarClock} highlight={(projectsData?.kpis?.overdueProjects ?? 0) > 0} loading={projectsLoading} />
        <KPICard title="Tarefas abertas" value={projectsData?.kpis?.openTasks ?? "-"} icon={ListTodo} loading={projectsLoading} />
      </div>

      {/* Chamados recentes - coluna direita, ocupa todas as linhas */}
      <div className="row-span-3 min-h-0 overflow-hidden">
        <RecentTicketsList data={ticketsData?.recent} loading={ticketsLoading} />
      </div>

      {/* Graficos - linha 2 */}
      <div className="col-span-3 grid grid-cols-2 gap-2 min-h-0 overflow-hidden">
        <TicketsByStatus data={ticketsData?.byStatus} loading={ticketsLoading} />
        <ProjectsByStatus data={projectsData?.byStatus} loading={projectsLoading} />
      </div>

      {/* Graficos - linha 3 */}
      <div className="col-span-3 grid grid-cols-2 gap-2 min-h-0 overflow-hidden">
        <ProjectProgress data={projectsData?.progress} loading={projectsLoading} />
        <TicketsTrend
          data={ticketsData?.trend}
          loading={ticketsLoading}
        />
      </div>
    </div>
  );
}
