"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Crown } from "lucide-react";
import type { ChartDataItem } from "@/types/glpi";

interface TicketsByTechnicianProps {
  data?: ChartDataItem[];
  loading?: boolean;
}

const PAGE_SIZE = 5;
const ROTATION_MS = 5000;

export function TicketsByTechnician({
  data,
  loading,
}: TicketsByTechnicianProps) {
  const [pageIndex, setPageIndex] = useState(0);

  const totalPages = data ? Math.max(1, Math.ceil(data.length / PAGE_SIZE)) : 1;
  const needsRotation = totalPages > 1;

  useEffect(() => {
    if (!needsRotation) return;
    const id = setInterval(() => {
      setPageIndex((p) => (p + 1) % totalPages);
    }, ROTATION_MS);
    return () => clearInterval(id);
  }, [needsRotation, totalPages]);

  useEffect(() => {
    setPageIndex(0);
  }, [data?.length]);

  useEffect(() => {
    if (pageIndex >= totalPages) setPageIndex(0);
  }, [pageIndex, totalPages]);

  const pageData = useMemo(() => {
    if (!data) return [];
    const start = pageIndex * PAGE_SIZE;
    return data.slice(start, start + PAGE_SIZE);
  }, [data, pageIndex]);

  if (loading || !data) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-1 pt-2 px-3 flex-shrink-0">
          <CardTitle className="text-xs">Ranking por Técnico</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 px-3 pb-2 space-y-2">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-3 w-6" />
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-2 flex-1 rounded-full" />
              <Skeleton className="h-4 w-8" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-1 pt-2 px-3 flex-shrink-0">
          <CardTitle className="text-xs">Ranking por Técnico</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 flex items-center justify-center px-3 pb-2">
          <p className="text-[10px] text-muted-foreground">
            Sem dados de técnico
          </p>
        </CardContent>
      </Card>
    );
  }

  const max = Math.max(...data.map((d) => d.value)) || 1;
  const total = data.reduce((s, d) => s + d.value, 0);
  const startPosition = pageIndex * PAGE_SIZE;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-1 pt-2 px-3 flex-shrink-0 flex flex-row items-baseline justify-between gap-2">
        <CardTitle className="text-xs">Ranking por Técnico</CardTitle>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground tabular-nums">
          {total.toLocaleString("pt-BR")} · histórico
        </span>
      </CardHeader>

      {needsRotation && (
        <div className="relative h-0.5 w-full bg-progress-track overflow-hidden flex-shrink-0">
          <div
            key={pageIndex}
            className="absolute inset-y-0 left-0 bg-glpi-primary tv-rotation-fill"
          />
        </div>
      )}

      <CardContent className="flex-1 min-h-0 flex flex-col overflow-hidden px-3 pb-2 gap-1">
        <ol key={pageIndex} className="flex-1 min-h-0 flex flex-col justify-around">
          {pageData.map((row, idx) => {
            const position = startPosition + idx + 1;
            return (
              <RankRow
                key={row.name + position}
                position={position}
                name={row.name}
                value={row.value}
                max={max}
                staggerDelay={idx * 80}
              />
            );
          })}
        </ol>

        {needsRotation && (
          <div
            className="flex shrink-0 items-center justify-center gap-1.5 pt-0.5"
            role="tablist"
            aria-label="Paginação do ranking"
          >
            {Array.from({ length: totalPages }).map((_, i) => (
              <span
                key={i}
                role="tab"
                aria-selected={i === pageIndex}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-500",
                  i === pageIndex
                    ? "w-4 bg-glpi-primary"
                    : "w-1.5 bg-muted-foreground/30",
                )}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface RankRowProps {
  position: number;
  name: string;
  value: number;
  max: number;
  staggerDelay?: number;
}

function RankRow({ position, name, value, max, staggerDelay = 0 }: RankRowProps) {
  const pct = (value / max) * 100;
  const isLeader = position === 1;

  return (
    <li
      style={{ animationDelay: `${staggerDelay}ms` }}
      className={cn(
        "tv-row-slide-in group flex items-center gap-2 rounded py-0.5 px-1 transition-colors hover:bg-muted/40",
      )}
    >
      <div className="flex w-6 flex-shrink-0 items-center justify-end gap-0.5">
        {isLeader && <Crown className="h-3 w-3 text-amber-500" aria-hidden />}
        <span
          className={cn(
            "text-right font-mono text-[11px] tabular-nums",
            isLeader ? "font-bold text-amber-500" : "text-muted-foreground",
          )}
        >
          {position}
        </span>
      </div>

      <span
        className={cn(
          "w-24 flex-shrink-0 truncate text-[11px]",
          isLeader ? "font-semibold text-amber-500" : "font-medium text-card-foreground",
        )}
        title={name}
      >
        {firstName(name)}
      </span>

      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-progress-track">
        <div
          style={{
            animationDelay: `${staggerDelay + 100}ms`,
            ["--bar-width" as string]: `${pct}%`,
          }}
          className={cn(
            "h-full rounded-full tv-bar-fill",
            isLeader
              ? "bg-gradient-to-r from-amber-500 to-amber-400"
              : "bg-glpi-primary",
          )}
        />
      </div>

      <span
        className={cn(
          "w-9 flex-shrink-0 text-right font-mono text-sm font-bold tabular-nums",
          isLeader ? "text-amber-500" : "text-card-foreground",
        )}
      >
        {value}
      </span>
    </li>
  );
}

function firstName(full: string): string {
  if (full === "Não atribuído") return full;
  const first = full.trim().split(/\s+/)[0] || full;
  return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
}
