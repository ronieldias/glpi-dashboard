"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Inbox,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Timer,
  TrendingUp,
} from "lucide-react";
import { useTicketsAll } from "@/hooks/useTickets";
import { KPICardTV } from "@/components/tv/KPICardTV";
import { BigChartCard } from "@/components/tv/BigChartCard";
import type { TicketKPIs, ChartDataItem } from "@/types/glpi";

interface BacklogByAge {
  today: number;
  week: number;
  month: number;
  older: number;
  total: number;
}

export default function TVOverviewPage() {
  const { data } = useTicketsAll();
  const kpis = (data?.kpis ?? null) as TicketKPIs | null;
  const backlog = (data?.backlogByAge ?? null) as BacklogByAge | null;
  const currentLoad = (kpis?.currentLoadByTech ?? []) as ChartDataItem[];

  const unassignedTone =
    !kpis
      ? "neutral"
      : kpis.unassigned >= 10
        ? "critical"
        : kpis.unassigned >= 5
          ? "warn"
          : "good";
  const oldestTone =
    !kpis
      ? "neutral"
      : kpis.oldestOpenDays >= 30
        ? "critical"
        : kpis.oldestOpenDays >= 14
          ? "warn"
          : "neutral";
  const slaCritTone =
    !kpis
      ? "neutral"
      : kpis.slaCriticalCount >= 3
        ? "critical"
        : kpis.slaCriticalCount >= 1
          ? "warn"
          : "good";
  const slaTodayTone =
    kpis?.slaTodayPct === null || kpis?.slaTodayPct === undefined
      ? "neutral"
      : kpis.slaTodayPct >= 90
        ? "good"
        : kpis.slaTodayPct >= 70
          ? "warn"
          : "bad";

  return (
    <div className="grid h-full grid-cols-12 grid-rows-[auto_minmax(0,1fr)] gap-3">
      <div className="col-span-3">
        <KPICardTV
          label="Em aberto"
          value={kpis?.totalOpen ?? "—"}
          icon={AlertTriangle}
          tone="neutral"
          delta={`${kpis?.slaOverdue ?? 0} com SLA vencido`}
        />
      </div>
      <div className="col-span-3">
        <KPICardTV
          label="Fila órfã"
          value={kpis?.unassigned ?? "—"}
          icon={Inbox}
          tone={unassignedTone}
          delta="Sem técnico nem grupo"
        />
      </div>
      <div className="col-span-3">
        <KPICardTV
          label="Mais antigo aberto"
          value={kpis?.oldestOpenDays ?? "—"}
          unit="dias"
          icon={Clock}
          tone={oldestTone}
        />
      </div>
      <div className="col-span-3">
        <KPICardTV
          label="SLA vence em 2h"
          value={kpis?.slaCriticalCount ?? "—"}
          icon={ShieldAlert}
          tone={slaCritTone}
        />
      </div>

      <BigChartCard
        title="Carga por técnico"
        subtitle="tickets em aberto · top 10"
        className="col-span-7"
        rightSlot={
          <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
            {currentLoad.length} ativos
          </span>
        }
      >
        <TechLoadTable rows={currentLoad} />
      </BigChartCard>

      <div className="col-span-5 grid grid-cols-2 grid-rows-2 gap-3">
        <KPICardTV
          label="Resolvidos hoje"
          value={kpis?.closedToday ?? "—"}
          icon={CheckCircle2}
          tone="good"
          delta={`${kpis?.openedToday ?? 0} novos hoje`}
        />
        <KPICardTV
          label="SLA hoje"
          value={kpis?.slaTodayPct ?? "—"}
          unit="%"
          icon={ShieldCheck}
          tone={slaTodayTone}
          delta={
            kpis?.slaYesterdayPct != null
              ? `${kpis.slaYesterdayPct}% ontem`
              : "—"
          }
        />
        <KPICardTV
          label="MTTR no mês"
          value={kpis?.avgResolutionHours ?? "—"}
          unit="h"
          icon={Timer}
          tone="neutral"
          delta={`${kpis?.closedThisMonth ?? 0} resolvidos no mês`}
        />
        <KPICardTV
          label="Reabertos no mês"
          value={kpis?.reopenedThisMonth ?? "—"}
          icon={RotateCcw}
          tone={
            !kpis
              ? "neutral"
              : kpis.reopenedThisMonth >= 5
                ? "warn"
                : "neutral"
          }
        />
      </div>
    </div>
  );
}

function TechLoadTable({ rows }: { rows: ChartDataItem[] }) {
  if (rows.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-zinc-500">
        Sem tickets atribuídos
      </div>
    );
  }

  const max = Math.max(...rows.map((r) => r.value)) || 1;

  return (
    <div className="flex h-full flex-col gap-1.5 overflow-y-auto">
      {rows.map((r, idx) => {
        const pct = (r.value / max) * 100;
        const isUnassigned = r.name === "Não atribuído";
        return (
          <div
            key={r.name + idx}
            className="grid grid-cols-[28px_minmax(0,1fr)_64px_minmax(0,1.2fr)] items-center gap-3 py-1.5"
          >
            <span className="text-right font-mono text-xs text-zinc-600 tabular-nums">
              {idx + 1}
            </span>
            <span
              className={`truncate text-sm ${isUnassigned ? "text-amber-400" : "text-zinc-200"}`}
              title={r.name}
            >
              {r.name}
            </span>
            <span className="text-right font-mono text-base font-semibold tabular-nums text-zinc-100">
              {r.value}
            </span>
            <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800/80">
              <div
                className={`h-full rounded-full transition-all ${
                  isUnassigned ? "bg-amber-500/70" : "bg-emerald-500/70"
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
