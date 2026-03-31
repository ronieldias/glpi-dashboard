"use client";

import { ProjectTasksSummary } from "@/components/dashboard/ProjectTasksSummary";
import { useProjectsAll } from "@/hooks/useProjects";

export function WidgetProjectTasksSummary() {
  const { data, isLoading } = useProjectsAll();
  return <ProjectTasksSummary data={data?.tasksSummary} loading={isLoading} />;
}
