"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { ChartDataItem, TechStatusLoad } from "@/types/glpi";

interface CurrentLoadProps {
  load?: ChartDataItem[];
  byTech?: TechStatusLoad[];
  byCategory?: ChartDataItem[];
  loading?: boolean;
}

const ORPHAN_NAME = "Não atribuído";
const HIGH_LOAD_THRESHOLD = 10;
const ROTATION_MS = 8000;

const VIEWS = [
  { key: "load", title: "Carga atual por técnico" },
  { key: "age", title: "Por tempo de abertura" },
  { key: "category", title: "Carga por categoria" },
] as const;

export function CurrentLoad({
  load,
  byTech,
  byCategory,
  loading,
}: CurrentLoadProps) {
  const [viewIndex, setViewIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setViewIndex((v) => (v + 1) % VIEWS.length);
    }, ROTATION_MS);
    return () => clearInterval(id);
  }, []);

  if (loading) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-1 pt-2 px-3 flex-shrink-0">
          <CardTitle className="text-xs">Carga atual por técnico</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 px-3 pb-3 flex flex-col justify-around">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-2 flex-1 rounded-full" />
              <Skeleton className="h-4 w-6" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const view = VIEWS[viewIndex];
  const loadTotal = (load ?? []).reduce((s, d) => s + d.value, 0);
  const subtitle =
    view.key === "load"
      ? `${loadTotal} em aberto`
      : view.key === "age"
        ? `${byTech?.length ?? 0} técnicos`
        : `${byCategory?.length ?? 0} categorias`;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-1 pt-2 px-3 flex-shrink-0 flex flex-row items-baseline justify-between gap-2">
        <CardTitle className="text-xs">{view.title}</CardTitle>
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground tabular-nums">
            {subtitle}
          </span>
          <div
            role="tablist"
            aria-label="Vistas"
            className="flex items-center gap-1"
          >
            {VIEWS.map((v, i) => (
              <span
                key={v.key}
                role="tab"
                aria-selected={i === viewIndex}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-500",
                  i === viewIndex
                    ? "w-4 bg-glpi-primary"
                    : "w-1.5 bg-muted-foreground/30",
                )}
              />
            ))}
          </div>
        </div>
      </CardHeader>

      <div className="relative h-0.5 w-full bg-progress-track overflow-hidden flex-shrink-0">
        <div
          key={viewIndex}
          className="absolute inset-y-0 left-0 bg-glpi-primary tv-rotation-fill"
          style={{ animationDuration: `${ROTATION_MS}ms` }}
        />
      </div>

      <CardContent className="flex-1 min-h-0 flex flex-col overflow-hidden px-3 pb-2">
        <div key={viewIndex} className="tv-fade-in flex flex-1 min-h-0 flex-col">
          {view.key === "load" && <LoadView data={load} />}
          {view.key === "age" && <StackedView data={byTech} />}
          {view.key === "category" && <CategoryView data={byCategory} />}
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyView({ text }: { text: string }) {
  return (
    <div className="flex flex-1 items-center justify-center">
      <p className="text-[10px] text-muted-foreground">{text}</p>
    </div>
  );
}

function LoadView({ data }: { data?: ChartDataItem[] }) {
  if (!data || data.length === 0)
    return <EmptyView text="Sem tickets atribuídos" />;

  const sorted = [...data].sort((a, b) => b.value - a.value);
  const techs = sorted.filter((d) => d.name !== ORPHAN_NAME);
  const orphans = sorted.filter((d) => d.name === ORPHAN_NAME);
  const rows = [...techs, ...orphans];

  const max = Math.max(...data.map((d) => d.value)) || 1;
  const avg =
    techs.length > 0
      ? techs.reduce((s, d) => s + d.value, 0) / techs.length
      : 0;
  const avgPct = (avg / max) * 100;

  return (
    <ul className="flex flex-1 min-h-0 flex-col justify-around">
      {rows.map((row) => (
        <LoadRow
          key={row.name}
          name={row.name}
          value={row.value}
          max={max}
          avgPct={avgPct}
        />
      ))}
    </ul>
  );
}

function LoadRow({
  name,
  value,
  max,
  avgPct,
}: {
  name: string;
  value: number;
  max: number;
  avgPct: number;
}) {
  const isOrphan = name === ORPHAN_NAME;
  const isHigh = !isOrphan && value >= HIGH_LOAD_THRESHOLD;
  const pct = (value / max) * 100;

  const barColor = isOrphan
    ? "bg-muted-foreground/40"
    : isHigh
      ? "bg-amber-500"
      : "bg-glpi-primary";
  const valueColor = isOrphan
    ? "text-muted-foreground"
    : isHigh
      ? "text-amber-500"
      : "text-glpi-primary";

  return (
    <li className="grid grid-cols-[5.5rem_minmax(0,1fr)_1.75rem] items-center gap-2">
      <span
        className={cn(
          "truncate text-[11px] font-medium",
          isOrphan ? "italic text-muted-foreground" : "text-card-foreground",
        )}
        title={`${name}: ${value} em aberto`}
      >
        {firstName(name)}
      </span>
      <div className="relative h-2 overflow-hidden rounded-full bg-progress-track">
        <div
          className={cn("h-full rounded-full transition-all duration-500", barColor)}
          style={{ width: `${pct}%` }}
        />
        {avgPct > 0 && avgPct < 100 && (
          <div
            className="absolute inset-y-0 w-px bg-card-foreground/50"
            style={{ left: `${avgPct}%` }}
            aria-hidden
          />
        )}
      </div>
      <span
        className={cn(
          "text-right font-mono text-sm font-bold tabular-nums",
          valueColor,
        )}
      >
        {value}
      </span>
    </li>
  );
}

function StackedView({ data }: { data?: TechStatusLoad[] }) {
  if (!data || data.length === 0) return <EmptyView text="Sem dados" />;

  const maxTotal = Math.max(...data.map((d) => d.total)) || 1;

  const legendMap = new Map<number, { label: string; color: string }>();
  for (const tech of data) {
    for (const seg of tech.segments) {
      if (!legendMap.has(seg.status))
        legendMap.set(seg.status, { label: seg.label, color: seg.color });
    }
  }
  const legend = Array.from(legendMap.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([, v]) => v);

  return (
    <div className="flex h-full flex-col gap-1.5">
      <ul className="flex flex-1 min-h-0 flex-col justify-around">
        {data.map((tech) => {
          const isOrphan = tech.name === ORPHAN_NAME;
          return (
            <li
              key={tech.name}
              className="grid grid-cols-[5rem_minmax(0,1fr)_1.5rem] items-center gap-2"
              title={`${tech.name}: ${tech.total} em aberto`}
            >
              <span
                className={cn(
                  "truncate text-[11px] font-medium",
                  isOrphan
                    ? "italic text-muted-foreground"
                    : "text-card-foreground",
                )}
              >
                {firstName(tech.name)}
              </span>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-progress-track">
                <div
                  className="flex h-full overflow-hidden rounded-full transition-all duration-500"
                  style={{ width: `${(tech.total / maxTotal) * 100}%` }}
                >
                  {tech.segments.map((seg) => (
                    <div
                      key={seg.status}
                      className="h-full"
                      style={{
                        width: `${(seg.value / tech.total) * 100}%`,
                        backgroundColor: seg.color,
                      }}
                      title={`${seg.label}: ${seg.value}`}
                    />
                  ))}
                </div>
              </div>
              <span className="text-right font-mono text-sm font-bold tabular-nums text-card-foreground">
                {tech.total}
              </span>
            </li>
          );
        })}
      </ul>

      <div className="flex flex-shrink-0 flex-wrap items-center gap-x-3 gap-y-1 border-t border-border/40 pt-1">
        {legend.map((s) => (
          <span
            key={s.label}
            className="flex items-center gap-1 text-[9px] text-muted-foreground"
          >
            <span
              className="h-2 w-2 rounded-sm"
              style={{ backgroundColor: s.color }}
              aria-hidden
            />
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function CategoryView({ data }: { data?: ChartDataItem[] }) {
  if (!data || data.length === 0) return <EmptyView text="Sem categorias" />;

  const max = Math.max(...data.map((d) => d.value)) || 1;

  return (
    <ul className="flex flex-1 min-h-0 flex-col justify-around">
      {data.map((item) => {
        const pct = (item.value / max) * 100;
        return (
          <li
            key={item.name}
            className="grid grid-cols-[minmax(0,1fr)_4rem_1.75rem] items-center gap-2"
            title={item.name}
          >
            <span className="truncate text-[11px] font-medium text-card-foreground">
              {categoryLeaf(item.name)}
            </span>
            <div className="h-1.5 overflow-hidden rounded-full bg-progress-track">
              <div
                className="h-full rounded-full bg-violet-500 transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-right font-mono text-sm font-bold tabular-nums text-card-foreground">
              {item.value}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function categoryLeaf(raw: string): string {
  const parts = raw.split(">").map((p) => p.trim()).filter(Boolean);
  return parts.length > 0 ? parts[parts.length - 1] : raw;
}

function firstName(full: string): string {
  if (full === ORPHAN_NAME) return full;
  const first = full.trim().split(/\s+/)[0] || full;
  return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
}
