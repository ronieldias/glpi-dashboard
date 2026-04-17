"use client";

import { ProjectsByStatus } from "@/components/dashboard/ProjectsByStatus";
import { useProjectsAll } from "@/hooks/useProjects";

export function WidgetProjectsByStatus() {
  const { data, isLoading } = useProjectsAll();
  return <ProjectsByStatus data={data?.byStatus} loading={isLoading} />;
}
