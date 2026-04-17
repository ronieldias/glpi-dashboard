"use client";

import { FolderCheck } from "lucide-react";
import { KPICard } from "@/components/dashboard/KPICard";
import { useProjectsAll } from "@/hooks/useProjects";

export function KPIProjectsDone() {
  const { data, isLoading } = useProjectsAll();
  return <KPICard title="Concluidos ano" value={data?.kpis?.completedThisYear ?? "-"} icon={FolderCheck} loading={isLoading} />;
}
