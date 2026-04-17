"use client";

import { ProjectProgress } from "@/components/dashboard/ProjectProgress";
import { useProjectsAll } from "@/hooks/useProjects";

export function WidgetProjectProgress() {
  const { data, isLoading } = useProjectsAll();
  return <ProjectProgress data={data?.progress} loading={isLoading} />;
}
