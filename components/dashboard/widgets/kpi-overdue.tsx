"use client";

import { CalendarClock } from "lucide-react";
import { KPICard } from "@/components/dashboard/KPICard";
import { useProjectsAll } from "@/hooks/useProjects";

export function KPIOverdue() {
  const { data, isLoading } = useProjectsAll();
  return <KPICard title="Prazo vencido" value={data?.kpis?.overdueProjects ?? "-"} icon={CalendarClock} highlight={(data?.kpis?.overdueProjects ?? 0) > 0} loading={isLoading} />;
}
