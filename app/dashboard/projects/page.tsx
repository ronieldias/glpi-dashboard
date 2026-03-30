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
    <div className="flex h-full flex-col gap-3">
      {/* KPIs */}
      <div className="grid grid-cols-4 gap-2">
        <KPICard title="Projetos ativos" value={data?.kpis?.activeProjects ?? "-"} icon={FolderKanban} loading={isLoading} />
        <KPICard title="Concluidos no ano" value={data?.kpis?.completedThisYear ?? "-"} icon={FolderCheck} loading={isLoading} />
        <KPICard title="Prazo vencido" value={data?.kpis?.overdueProjects ?? "-"} icon={CalendarClock} highlight={(data?.kpis?.overdueProjects ?? 0) > 0} loading={isLoading} />
        <KPICard title="Tarefas em aberto" value={data?.kpis?.openTasks ?? "-"} icon={ListTodo} loading={isLoading} />
      </div>

      {/* Conteudo principal */}
      <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-2 min-h-0">
        {/* Linha 1 */}
        <ProjectsByStatus data={data?.byStatus} loading={isLoading} />
        <ProjectProgress data={data?.progress} loading={isLoading} />
        {/* Linha 2 */}
        <ProjectTasksSummary data={data?.tasksSummary} loading={isLoading} />
        <ProjectTimeline data={data?.timeline} loading={isLoading} />
      </div>

      {/* Tabela compacta */}
      <Card className="shrink-0">
        <CardHeader className="pb-1 pt-2 px-3">
          <CardTitle className="text-xs">Lista de Projetos</CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-2">
          {isLoading ? (
            <div className="space-y-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-auto max-h-[120px]">
              <table className="w-full text-[10px]">
                <thead>
                  <tr className="border-b text-gray-500">
                    <th className="text-left py-1 font-medium">Nome</th>
                    <th className="text-left py-1 font-medium w-20">Status</th>
                    <th className="text-left py-1 font-medium w-24">Responsavel</th>
                    <th className="text-left py-1 font-medium w-16">Progresso</th>
                    <th className="text-left py-1 font-medium w-20">Data fim</th>
                    <th className="text-right py-1 font-medium w-24">Prazo</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.list?.slice(0, 8).map(
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
                      <tr key={project.id} className="border-b border-gray-50">
                        <td className="py-1 truncate max-w-[200px] font-medium text-gray-800">{project.name}</td>
                        <td className="py-1">
                          <Badge
                            variant={project.status === "Atrasado" ? "destructive" : project.status === "Concluido" ? "success" : "secondary"}
                            className="text-[8px] px-1 py-0"
                          >
                            {project.status}
                          </Badge>
                        </td>
                        <td className="py-1 text-gray-500">{project.manager}</td>
                        <td className="py-1">
                          <div className="flex items-center gap-1">
                            <div className="h-1.5 flex-1 rounded-full bg-gray-200">
                              <div className="h-full rounded-full bg-glpi-primary" style={{ width: `${project.percent_done}%` }} />
                            </div>
                            <span className="text-gray-500">{project.percent_done}%</span>
                          </div>
                        </td>
                        <td className="py-1 text-gray-500">{formatDateShort(project.plan_end_date)}</td>
                        <td className="py-1 text-right">
                          {project.daysRemaining !== null ? (
                            <span className={project.isOverdue ? "text-red-600 font-medium" : "text-green-600"}>
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
