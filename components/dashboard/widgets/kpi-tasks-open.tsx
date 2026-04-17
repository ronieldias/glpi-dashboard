"use client";

import { ListTodo } from "lucide-react";
import { KPICard } from "@/components/dashboard/KPICard";
import { useProjectsAll } from "@/hooks/useProjects";

export function KPITasksOpen() {
  const { data, isLoading } = useProjectsAll();
  return <KPICard title="Tarefas abertas" value={data?.kpis?.openTasks ?? "-"} icon={ListTodo} loading={isLoading} />;
}
