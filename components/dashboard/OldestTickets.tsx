"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { OldestTicket } from "@/types/glpi";

interface OldestTicketsProps {
  data?: OldestTicket[];
  loading?: boolean;
}

const ORPHAN_NAME = "Não atribuído";

export function OldestTickets({ data, loading }: OldestTicketsProps) {
  if (loading || !data) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-1 pt-2 px-3 flex-shrink-0">
          <CardTitle className="text-xs">Chamados Antigos</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 px-3 pb-2 flex flex-col justify-around">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-3 flex-1" />
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
          <CardTitle className="text-xs">Chamados Antigos</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 flex items-center justify-center px-3 pb-2">
          <p className="text-[10px] text-muted-foreground">
            Sem chamados em aberto
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-1 pt-2 px-3 flex-shrink-0 flex flex-row items-baseline justify-between gap-2">
        <CardTitle className="text-xs">Chamados Antigos</CardTitle>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground tabular-nums">
          top {data.length} · em aberto
        </span>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 overflow-hidden px-3 pb-2">
        <ul className="flex h-full flex-col justify-around">
          {data.map((t) => (
            <li
              key={t.id}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-b border-border/40 py-0.5 last:border-b-0"
              title={t.name}
            >
              <div className="min-w-0">
                <p className="truncate text-[11px] font-medium leading-tight text-card-foreground">
                  {t.name}
                </p>
                <p className="truncate text-[10px] leading-tight text-muted-foreground">
                  {firstNames(t.technician)}
                </p>
              </div>
              <div className="flex flex-col items-end leading-none">
                <span
                  className={cn(
                    "font-mono text-xs font-bold tabular-nums",
                    ageColor(t.ageDays),
                  )}
                >
                  {t.ageDays}d
                </span>
                <span className="mt-0.5 font-mono text-[9px] tabular-nums text-muted-foreground">
                  {formatShortDate(t.date_creation)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function ageColor(days: number): string {
  if (days >= 30) return "text-red-400";
  if (days >= 7) return "text-amber-400";
  return "text-card-foreground";
}

function formatShortDate(raw: string): string {
  const datePart = (raw || "").split(" ")[0];
  const [, month, day] = datePart.split("-");
  return month && day ? `${day}/${month}` : datePart;
}

function firstNames(full: string): string {
  if (full === ORPHAN_NAME) return full;
  return full
    .split(",")
    .map((part) => part.trim().split(/\s+/)[0])
    .filter(Boolean)
    .map((name) => name.charAt(0).toUpperCase() + name.slice(1).toLowerCase())
    .join(", ");
}
