"use client";

import { CheckCircle2, FolderKanban, ListTodo, Timer } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useProjectsAll } from "@/hooks/useProjects";
import { BigChartCard } from "@/components/tv/BigChartCard";
import { KPICardTV } from "@/components/tv/KPICardTV";
import type { ProjectKPIs, ChartDataItem } from "@/types/glpi";

interface ProjectProgressItem {
  id: number;
  name: string;
  percent: number;
}

export default function TVProjectsPage() {
  const { data } = useProjectsAll();
  const kpis = (data?.kpis ?? null) as ProjectKPIs | null;
  const byStatus = (data?.byStatus ?? []) as ChartDataItem[];
  const progress = ((data?.progress ?? []) as ProjectProgressItem[]).slice(0, 10);

  const overdueTone =
    !kpis
      ? "neutral"
      : kpis.overdueProjects >= 3
        ? "critical"
        : kpis.overdueProjects >= 1
          ? "warn"
          : "good";

  return (
    <div className="grid h-full grid-cols-12 grid-rows-[auto_minmax(0,1fr)] gap-3">
      <div className="col-span-3">
        <KPICardTV
          label="Ativos"
          value={kpis?.activeProjects ?? "—"}
          icon={FolderKanban}
        />
      </div>
      <div className="col-span-3">
        <KPICardTV
          label="Concluídos no ano"
          value={kpis?.completedThisYear ?? "—"}
          icon={CheckCircle2}
          tone="good"
        />
      </div>
      <div className="col-span-3">
        <KPICardTV
          label="Atrasados"
          value={kpis?.overdueProjects ?? "—"}
          icon={Timer}
          tone={overdueTone}
        />
      </div>
      <div className="col-span-3">
        <KPICardTV
          label="Tarefas abertas"
          value={kpis?.openTasks ?? "—"}
          icon={ListTodo}
        />
      </div>

      <BigChartCard
        title="Por status"
        subtitle="distribuição"
        className="col-span-5"
      >
        {byStatus.length === 0 ? (
          <EmptyState text="Sem projetos" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={byStatus}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius="55%"
                outerRadius="85%"
                paddingAngle={2}
                stroke="#0a0c10"
                strokeWidth={2}
              >
                {byStatus.map((item, idx) => (
                  <Cell key={idx} fill={item.color ?? "#71717a"} />
                ))}
              </Pie>
              <Tooltip {...tooltipProps} />
            </PieChart>
          </ResponsiveContainer>
        )}
        {byStatus.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
            {byStatus.map((item) => (
              <div
                key={item.name}
                className="flex items-center gap-1.5 text-xs"
              >
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ background: item.color ?? "#71717a" }}
                  aria-hidden
                />
                <span className="text-zinc-400">{item.name}</span>
                <span className="font-mono font-semibold tabular-nums text-zinc-200">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        )}
      </BigChartCard>

      <BigChartCard
        title="Progresso"
        subtitle="top 10"
        className="col-span-7"
      >
        {progress.length === 0 ? (
          <EmptyState text="Sem projetos" />
        ) : (
          <div className="flex h-full flex-col gap-1.5 overflow-y-auto">
            {progress.map((p, idx) => (
              <div
                key={p.id}
                className="grid grid-cols-[28px_minmax(0,1fr)_56px_minmax(0,1.4fr)] items-center gap-3 py-1.5"
              >
                <span className="text-right font-mono text-xs tabular-nums text-zinc-600">
                  {idx + 1}
                </span>
                <span className="truncate text-sm text-zinc-200" title={p.name}>
                  {p.name}
                </span>
                <span className="text-right font-mono text-base font-semibold tabular-nums text-zinc-100">
                  {p.percent}
                  <span className="ml-0.5 text-xs text-zinc-500">%</span>
                </span>
                <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800/80">
                  <div
                    className="h-full rounded-full bg-emerald-500/70 transition-all"
                    style={{ width: `${Math.min(100, p.percent)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </BigChartCard>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex h-full items-center justify-center text-sm text-zinc-500">
      {text}
    </div>
  );
}

const tooltipProps = {
  cursor: { fill: "#ffffff08" },
  contentStyle: {
    background: "#18181b",
    border: "1px solid #27272a",
    borderRadius: 6,
    fontSize: 12,
    color: "#fafafa",
    padding: "6px 10px",
  },
  itemStyle: { color: "#fafafa" },
  labelStyle: { color: "#a1a1aa", fontSize: 11, marginBottom: 2 },
} as const;
