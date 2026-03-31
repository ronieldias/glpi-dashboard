"use client";

import { ProjectTimeline } from "@/components/dashboard/ProjectTimeline";
import { useProjectsAll } from "@/hooks/useProjects";

export function WidgetProjectTimeline() {
  const { data, isLoading } = useProjectsAll();
  return <ProjectTimeline data={data?.timeline} loading={isLoading} />;
}
