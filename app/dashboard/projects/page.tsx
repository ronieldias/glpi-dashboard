"use client";

import { FolderKanban, FolderCheck, CalendarClock, ListTodo } from "lucide-react";
import { KPICard } from "@/components/dashboard/KPICard";
import { ProjectsByStatus } from "@/components/dashboard/ProjectsByStatus";
import { ProjectProgress } from "@/components/dashboard/ProjectProgress";
import { ProjectTasksSummary } from "@/components/dashboard/ProjectTasksSummary";
import { ProjectTimeline } from "@/components/dashboard/ProjectTimeline";
import { useProjectsAll } from "@/hooks/useProjects";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateShort } from "@/lib/utils";

export default function ProjectsPage() {
  const { data, isLoading } = useProjectsAll();

  return (
    <div className="h-full grid grid-rows-[auto_minmax(0,1fr)_minmax(0,1fr)_auto] gap-2 overflow-hidden">
      {/* KPIs */}
      <div className="grid grid-cols-4 gap-2">
        <KPICard title="Projetos ativos" value={data?.kpis?.activeProjects ?? "-"} icon={FolderKanban} loading={isLoading} />
        <KPICard title="Concluidos no ano" value={data?.kpis?.completedThisYear ?? "-"} icon={FolderCheck} loading={isLoading} />
        <KPICard title="Prazo vencido" value={data?.kpis?.overdueProjects ?? "-"} icon={CalendarClock} highlight={(data?.kpis?.overdueProjects ?? 0) > 0} loading={isLoading} />
        <KPICard title="Tarefas abertas" value={data?.kpis?.openTasks ?? "-"} icon={ListTodo} loading={isLoading} />
      </div>

      {/* Graficos - linha 1 */}
      <div className="grid grid-cols-2 gap-2 min-h-0 overflow-hidden">
        <ProjectsByStatus data={data?.byStatus} loading={isLoading} />
        <ProjectProgress data={data?.progress} loading={isLoading} />
      </div>

      {/* Graficos - linha 2 */}
      <div className="grid grid-cols-2 gap-2 min-h-0 overflow-hidden">
        <ProjectTasksSummary data={data?.tasksSummary} loading={isLoading} />
        <ProjectTimeline data={data?.timeline} loading={isLoading} />
      </div>

      {/* Tabela compacta */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-0.5 pt-1.5 px-3">
          <CardTitle className="text-xs">Lista de Projetos</CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-2">
          {isLoading ? (
            <div className="space-y-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-5 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-auto max-h-[13vh]">
              <table className="w-full text-[10px]">
                <thead>
                  <tr className="border-b text-muted">
                    <th className="text-left py-0.5 font-medium">Nome</th>
                    <th className="text-left py-0.5 font-medium w-20">Status</th>
                    <th className="text-left py-0.5 font-medium w-24">Responsavel</th>
                    <th className="text-left py-0.5 font-medium w-16">Progresso</th>
                    <th className="text-left py-0.5 font-medium w-20">Data fim</th>
                    <th className="text-right py-0.5 font-medium w-24">Prazo</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.list?.slice(0, 6).map(
                    (project: {
                      id: number;
                      name: string;
                      status: string;
                      manager: string;
                      percent_done: number;
                      plan_end_date: string | null;
                      daysRemaining: number | null;
                      isOverdue: boolean;
                    }) => (
                      <tr key={project.id} className="border-b border-[var(--color-border)]">
                        <td className="py-0.5 truncate max-w-[200px] font-medium text-card-foreground">{project.name}</td>
                        <td className="py-0.5">
                          <Badge
                            variant={project.status === "Atrasado" ? "destructive" : project.status === "Concluido" ? "success" : "secondary"}
                            className="text-[8px] px-1 py-0"
                          >
                            {project.status}
                          </Badge>
                        </td>
                        <td className="py-0.5 text-muted">{project.manager}</td>
                        <td className="py-0.5">
                          <div className="flex items-center gap-1">
                            <div className="h-1.5 flex-1 rounded-full bg-progress-track">
                              <div className="h-full rounded-full bg-glpi-primary" style={{ width: `${project.percent_done}%` }} />
                            </div>
                            <span className="text-muted">{project.percent_done}%</span>
                          </div>
                        </td>
                        <td className="py-0.5 text-muted">{formatDateShort(project.plan_end_date)}</td>
                        <td className="py-0.5 text-right">
                          {project.daysRemaining !== null ? (
                            <span className={project.isOverdue ? "text-red-600 dark:text-red-400 font-medium" : "text-green-600 dark:text-green-400"}>
                              {project.isOverdue ? `${Math.abs(project.daysRemaining)}d vencido` : `${project.daysRemaining}d restantes`}
                            </span>
                          ) : "-"}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
