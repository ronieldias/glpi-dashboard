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
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-0.5 pt-1.5 px-3 flex-shrink-0">
          <CardTitle className="text-xs">Timeline dos Projetos</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 px-3 pb-2">
          <Skeleton className="h-full w-full" />
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-0.5 pt-1.5 px-3 flex-shrink-0">
          <CardTitle className="text-xs">Timeline dos Projetos</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 flex items-center justify-center px-3 pb-2">
          <p className="text-center text-[10px] text-muted-foreground">
            Nenhum projeto com datas planejadas
          </p>
        </CardContent>
      </Card>
    );
  }

  const allDates = data.flatMap((p) => [
    new Date(p.start).getTime(),
    new Date(p.end).getTime(),
  ]);
  const minDate = Math.min(...allDates);
  const maxDate = Math.max(...allDates);
  const totalRange = maxDate - minDate || 1;
  const todayTime = Date.now();
  const todayOffset = ((todayTime - minDate) / totalRange) * 100;
  const showToday = todayOffset >= 0 && todayOffset <= 100;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-0.5 pt-1.5 px-3 flex-shrink-0">
        <CardTitle className="text-xs">Timeline dos Projetos</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 px-3 pb-2 flex flex-col">
        <div className="flex-1 min-h-0 flex flex-col justify-evenly overflow-hidden">
          {data.map((project) => {
            const startOffset =
              ((new Date(project.start).getTime() - minDate) / totalRange) *
              100;
            const width =
              ((new Date(project.end).getTime() -
                new Date(project.start).getTime()) /
                totalRange) *
              100;
            const isOverdue =
              new Date(project.end) < new Date() && project.percent < 100;

            return (
              <div
                key={project.id}
                className="flex items-center gap-2 min-h-0 shrink-0"
              >
                <div className="w-28 shrink-0 truncate text-[9px] text-muted">
                  {project.name}
                </div>
                <div className="relative h-5 flex-1 rounded bg-progress-track min-w-0">
                  <div
                    className="absolute top-0 h-full rounded"
                    style={{
                      left: `${startOffset}%`,
                      width: `${Math.max(width, 2)}%`,
                      backgroundColor: isOverdue ? "#EF4444" : "#AEC43B",
                      opacity: 0.8,
                    }}
                  />
                  {showToday && (
                    <div
                      className="pointer-events-none absolute w-0.5 bg-sky-400 dark:bg-sky-300 z-10"
                      style={{
                        left: `${todayOffset}%`,
                        top: "-6px",
                        bottom: "-6px",
                      }}
                      title="Hoje"
                    />
                  )}
                  <span
                    className="absolute top-0.5 text-[8px] font-medium text-white"
                    style={{ left: `${startOffset + 1}%` }}
                  >
                    {project.percent}%
                  </span>
                </div>
                <div className="w-28 shrink-0 text-right text-[8px] text-muted-foreground">
                  {formatDateShort(project.start)} -{" "}
                  {formatDateShort(project.end)}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
