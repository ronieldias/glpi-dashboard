"use client";

import { ProjectsTable } from "@/components/dashboard/ProjectsTable";
import { useProjectsAll } from "@/hooks/useProjects";

export function WidgetProjectsTable() {
  const { data, isLoading } = useProjectsAll();
  return <ProjectsTable data={data?.list} loading={isLoading} />;
}
