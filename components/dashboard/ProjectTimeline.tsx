"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateShort } from "@/lib/utils";
import type { ProjectTimelineItem } from "@/types/glpi";

interface ProjectTimelineProps {
  data?: ProjectTimelineItem[];
  loading?: boolean;
}

export function ProjectTimeline({ data, loading }: ProjectTimelineProps) {
  if (loading || !data) {
    return (
      <Card>
        <CardHeader className="pb-0.5 pt-1.5 px-3">
          <CardTitle className="text-xs">Timeline dos Projetos</CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-2">
          <Skeleton className="h-[150px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-0.5 pt-1.5 px-3">
          <CardTitle className="text-xs">Timeline dos Projetos</CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-2">
          <p className="text-center text-[10px] text-muted-foreground">Nenhum projeto com datas planejadas</p>
        </CardContent>
      </Card>
    );
  }

  const allDates = data.flatMap((p) => [new Date(p.start).getTime(), new Date(p.end).getTime()]);
  const minDate = Math.min(...allDates);
  const maxDate = Math.max(...allDates);
  const totalRange = maxDate - minDate || 1;

  return (
    <Card>
      <CardHeader className="pb-0.5 pt-1.5 px-3">
        <CardTitle className="text-xs">Timeline dos Projetos</CardTitle>
      </CardHeader>
      <CardContent className="px-3 pb-2">
        <div className="space-y-1.5">
          {data.map((project) => {
            const startOffset = ((new Date(project.start).getTime() - minDate) / totalRange) * 100;
            const width = ((new Date(project.end).getTime() - new Date(project.start).getTime()) / totalRange) * 100;
            const isOverdue = new Date(project.end) < new Date() && project.percent < 100;

            return (
              <div key={project.id} className="flex items-center gap-2">
                <div className="w-28 shrink-0 truncate text-[9px] text-muted">{project.name}</div>
                <div className="relative h-5 flex-1 rounded bg-progress-track">
                  <div
                    className="absolute top-0 h-full rounded"
                    style={{
                      left: `${startOffset}%`,
                      width: `${Math.max(width, 2)}%`,
                      backgroundColor: isOverdue ? "#EF4444" : "#AEC43B",
                      opacity: 0.8,
                    }}
                  />
                  <span
                    className="absolute top-0.5 text-[8px] font-medium text-white"
                    style={{ left: `${startOffset + 1}%` }}
                  >
                    {project.percent}%
                  </span>
                </div>
                <div className="w-28 shrink-0 text-right text-[8px] text-muted-foreground">
                  {formatDateShort(project.start)} - {formatDateShort(project.end)}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
