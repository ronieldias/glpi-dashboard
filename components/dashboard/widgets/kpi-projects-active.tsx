"use client";

import { FolderKanban } from "lucide-react";
import { KPICard } from "@/components/dashboard/KPICard";
import { useProjectsAll } from "@/hooks/useProjects";

export function KPIProjectsActive() {
  const { data, isLoading } = useProjectsAll();
  return <KPICard title="Projetos ativos" value={data?.kpis?.activeProjects ?? "-"} icon={FolderKanban} loading={isLoading} />;
}
