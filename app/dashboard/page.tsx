"use client";

import { Ticket, CheckCircle, AlertTriangle, Clock, FolderKanban, FolderCheck, CalendarClock, ListTodo } from "lucide-react";
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
    <div className="flex h-full flex-col gap-3">
      {/* KPIs */}
      <div className="grid grid-cols-8 gap-2">
        <KPICard title="Chamados abertos" value={ticketsData?.kpis?.totalOpen ?? "-"} icon={Ticket} loading={ticketsLoading} />
        <KPICard title="Fechados no mes" value={ticketsData?.kpis?.closedThisMonth ?? "-"} icon={CheckCircle} loading={ticketsLoading} />
        <KPICard title="SLA vencido" value={ticketsData?.kpis?.slaOverdue ?? "-"} icon={AlertTriangle} highlight={(ticketsData?.kpis?.slaOverdue ?? 0) > 0} loading={ticketsLoading} />
        <KPICard title="Tempo medio" value={ticketsData?.kpis?.avgResolutionHours ? `${ticketsData.kpis.avgResolutionHours}h` : "-"} icon={Clock} loading={ticketsLoading} />
        <KPICard title="Projetos ativos" value={projectsData?.kpis?.activeProjects ?? "-"} icon={FolderKanban} loading={projectsLoading} />
        <KPICard title="Concluidos ano" value={projectsData?.kpis?.completedThisYear ?? "-"} icon={FolderCheck} loading={projectsLoading} />
        <KPICard title="Prazo vencido" value={projectsData?.kpis?.overdueProjects ?? "-"} icon={CalendarClock} highlight={(projectsData?.kpis?.overdueProjects ?? 0) > 0} loading={projectsLoading} />
        <KPICard title="Tarefas abertas" value={projectsData?.kpis?.openTasks ?? "-"} icon={ListTodo} loading={projectsLoading} />
      </div>

      {/* Conteudo principal */}
      <div className="flex-1 grid grid-cols-4 gap-2 min-h-0">
        {/* Coluna 1-3: Graficos */}
        <div className="col-span-3 grid grid-cols-3 grid-rows-2 gap-2 min-h-0">
          <TicketsByStatus data={ticketsData?.byStatus} loading={ticketsLoading} />
          <ProjectsByStatus data={projectsData?.byStatus} loading={projectsLoading} />
          <ProjectProgress data={projectsData?.progress} loading={projectsLoading} />
          <div className="col-span-3">
            <TicketsTrend
              data7={ticketsData?.trend7}
              data30={ticketsData?.trend30}
              data90={ticketsData?.trend90}
              loading={ticketsLoading}
            />
          </div>
        </div>

        {/* Coluna 4: Lista de chamados recentes */}
        <RecentTicketsList data={ticketsData?.recent} loading={ticketsLoading} />
      </div>
    </div>
  );
}
