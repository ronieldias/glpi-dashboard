"use client";

import { AlertTriangle, Inbox, Timer, TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTicketsAll } from "@/hooks/useTickets";
import { BigChartCard } from "@/components/tv/BigChartCard";
import { KPICardTV } from "@/components/tv/KPICardTV";
import { splitByOpenClosed } from "@/lib/ticket-status";
import type { TicketKPIs, ChartDataItem, TrendDataItem } from "@/types/glpi";

interface BacklogByAge {
  today: number;
  week: number;
  month: number;
  older: number;
  total: number;
}

export default function TVTicketsPage() {
  const { data } = useTicketsAll();
  const kpis = (data?.kpis ?? null) as TicketKPIs | null;
  const byStatus = (data?.byStatus ?? []) as ChartDataItem[];
  const trend = (data?.trend ?? []) as TrendDataItem[];
  const backlog = (data?.backlogByAge ?? null) as BacklogByAge | null;
  const mttrByPriority = (kpis?.mttrByPriority ?? []) as ChartDataItem[];

  const olderTone =
    !backlog
      ? "neutral"
      : backlog.older >= 1
        ? "critical"
        : "good";

  return (
    <div className="grid h-full grid-cols-12 grid-rows-[auto_minmax(0,1fr)_minmax(0,1fr)] gap-3">
      <div className="col-span-3">
        <KPICardTV
          label="Em aberto"
          value={kpis?.totalOpen ?? "—"}
          icon={AlertTriangle}
          delta={`${kpis?.slaOverdue ?? 0} com SLA vencido`}
        />
      </div>
      <div className="col-span-3">
        <KPICardTV
          label="Abertos hoje"
          value={backlog?.today ?? "—"}
          icon={Inbox}
          tone={!backlog ? "neutral" : backlog.today >= 10 ? "warn" : "neutral"}
        />
      </div>
      <div className="col-span-3">
        <KPICardTV
          label="7+ dias parados"
          value={backlog?.week ?? "—"}
          icon={Timer}
          tone={!backlog ? "neutral" : backlog.week >= 5 ? "warn" : "neutral"}
        />
      </div>
      <div className="col-span-3">
        <KPICardTV
          label="30+ dias parados"
          value={backlog?.older ?? "—"}
          icon={Timer}
          tone={olderTone}
        />
      </div>

      <BigChartCard
        title="Por status"
        subtitle="abertos × concluídos"
        className="col-span-6"
      >
        <StatusBreakdown data={byStatus} />
      </BigChartCard>

      <BigChartCard
        title="MTTR por prioridade"
        subtitle="horas · resolvidos no mês"
        className="col-span-6"
      >
        {mttrByPriority.length === 0 ? (
          <EmptyState text="Sem resolvidos no mês" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={mttrByPriority}
              margin={{ top: 12, right: 16, left: 0, bottom: 0 }}
            >
              <CartesianGrid stroke="#27272a" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="#52525b"
                tick={{ fontSize: 11, fill: "#a1a1aa" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                stroke="#52525b"
                tick={{ fontSize: 11, fill: "#71717a" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip {...tooltipProps} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {mttrByPriority.map((item, idx) => (
                  <Cell key={idx} fill={item.color ?? "#AEC43B"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </BigChartCard>

      <BigChartCard
        title="Tendência"
        subtitle="abertos e fechados nos últimos 30 dias"
        className="col-span-12"
        rightSlot={
          <div className="flex items-center gap-3 text-[10px] uppercase tracking-wider">
            <span className="flex items-center gap-1.5 text-zinc-400">
              <span
                className="inline-block h-1.5 w-3 rounded-full bg-amber-400"
                aria-hidden
              />
              Abertos
            </span>
            <span className="flex items-center gap-1.5 text-zinc-400">
              <span
                className="inline-block h-1.5 w-3 rounded-full bg-emerald-400"
                aria-hidden
              />
              Fechados
            </span>
          </div>
        }
      >
        {trend.length === 0 ? (
          <EmptyState text="Sem dados de tendência" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={trend}
              margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
            >
              <CartesianGrid stroke="#27272a" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#52525b"
                tick={{ fontSize: 11, fill: "#71717a" }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                stroke="#52525b"
                tick={{ fontSize: 11, fill: "#71717a" }}
                axisLine={false}
                tickLine={false}
                width={32}
              />
              <Tooltip {...tooltipProps} />
              <Line
                type="monotone"
                dataKey="opened"
                name="Abertos"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="closed"
                name="Fechados"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
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

function StatusBreakdown({ data }: { data: ChartDataItem[] }) {
  if (data.length === 0) return <EmptyState text="Sem dados" />;

  const { open, done, openTotal, doneTotal, total } = splitByOpenClosed(data);
  const openPct = total > 0 ? (openTotal / total) * 100 : 0;
  const donePct = total > 0 ? (doneTotal / total) * 100 : 0;

  return (
    <div className="flex h-full flex-col justify-center gap-6">
      <div className="grid grid-cols-2 gap-8">
        <StatusGroupTotal
          label="Em aberto"
          value={openTotal}
          pct={openPct}
          valueClass="text-amber-400"
        />
        <StatusGroupTotal
          label="Concluídos"
          value={doneTotal}
          pct={donePct}
          valueClass="text-emerald-400"
        />
      </div>

      <div className="flex h-4 w-full overflow-hidden rounded-full bg-zinc-800">
        {open.map((item) => (
          <StatusBarSegment key={item.name} item={item} total={total} />
        ))}
        {open.length > 0 && done.length > 0 && (
          <div className="h-full w-1 flex-shrink-0 bg-[#0a0c10]" aria-hidden />
        )}
        {done.map((item) => (
          <StatusBarSegment key={item.name} item={item} total={total} />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-x-10 gap-y-2.5">
        <StatusColumn heading="Abertos" items={open} />
        <StatusColumn heading="Concluídos" items={done} />
      </div>
    </div>
  );
}

function StatusGroupTotal({
  label,
  value,
  pct,
  valueClass,
}: {
  label: string;
  value: number;
  pct: number;
  valueClass: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs uppercase tracking-wider text-zinc-500">{label}</span>
      <div className="flex items-baseline gap-2">
        <span className={`text-5xl font-bold leading-none tabular-nums ${valueClass}`}>
          {value}
        </span>
        <span className="text-sm tabular-nums text-zinc-500">{pct.toFixed(0)}%</span>
      </div>
    </div>
  );
}

function StatusBarSegment({ item, total }: { item: ChartDataItem; total: number }) {
  const pct = (item.value / total) * 100;
  if (pct === 0) return null;
  return (
    <div
      className="h-full"
      style={{ width: `${pct}%`, backgroundColor: item.color ?? "#71717a" }}
      aria-label={`${item.name}: ${item.value}`}
    />
  );
}

function StatusColumn({
  heading,
  items,
}: {
  heading: string;
  items: ChartDataItem[];
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <span className="text-[11px] uppercase tracking-wider text-zinc-600">{heading}</span>
      {items.length === 0 ? (
        <span className="text-sm text-zinc-600">Nenhum</span>
      ) : (
        items.map((item) => (
          <div key={item.name} className="flex items-center gap-2.5">
            <span
              className="inline-block h-2.5 w-2.5 flex-shrink-0 rounded-sm"
              style={{ background: item.color ?? "#71717a" }}
              aria-hidden
            />
            <span className="min-w-0 flex-1 truncate text-sm text-zinc-300">
              {item.name}
            </span>
            <span className="font-mono text-base font-semibold tabular-nums text-zinc-100">
              {item.value}
            </span>
          </div>
        ))
      )}
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
