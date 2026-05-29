"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { splitByOpenClosed } from "@/lib/ticket-status";
import type { ChartDataItem } from "@/types/glpi";

interface TicketsByStatusProps {
  data?: ChartDataItem[];
  loading?: boolean;
}

/**
 * Status dos Chamados — agrupa a distribuição em dois blocos com leituras
 * operacionais distintas:
 *
 * - **Em aberto** (Novo / Em atendimento / Planejado / Pendente): o que ainda
 *   demanda ação. É o número que importa no dia a dia do helpdesk.
 * - **Concluídos** (Resolvido / Fechado): histórico, costuma dominar o volume.
 *
 * Sem separar os dois, "Fechado" engole a barra e os status acionáveis viram
 * slivers ilegíveis. A barra única no topo mostra a proporção aberto×concluído;
 * as colunas abaixo detalham cada status sem repetir a proporção por item.
 */
export function TicketsByStatus({ data, loading }: TicketsByStatusProps) {
  if (loading || !data) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-1 pt-2 px-3 flex-shrink-0">
          <CardTitle className="text-xs">Status dos Chamados</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 px-3 pb-3 space-y-2">
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
          <Skeleton className="h-2.5 w-full rounded-full" />
          <div className="grid grid-cols-2 gap-3 pt-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-3 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-1 pt-2 px-3 flex-shrink-0">
          <CardTitle className="text-xs">Status dos Chamados</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 flex items-center justify-center px-3 pb-3">
          <p className="text-[10px] text-muted-foreground">Sem dados</p>
        </CardContent>
      </Card>
    );
  }

  const { open, done, openTotal, doneTotal, total } = splitByOpenClosed(data);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-1 pt-2 px-3 flex-shrink-0 flex flex-row items-baseline justify-between gap-2">
        <CardTitle className="text-xs">Status dos Chamados</CardTitle>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground tabular-nums">
          {total.toLocaleString("pt-BR")} total
        </span>
      </CardHeader>

      <CardContent className="flex-1 min-h-0 flex flex-col gap-3 px-3 pb-3 overflow-hidden">
        {/* Resumo: os dois totais lado a lado */}
        <div className="grid grid-cols-2 gap-3 flex-shrink-0">
          <GroupTotal
            label="Em aberto"
            value={openTotal}
            total={total}
            accentClass="text-amber-500 dark:text-amber-400"
          />
          <GroupTotal
            label="Concluídos"
            value={doneTotal}
            total={total}
            accentClass="text-emerald-600 dark:text-emerald-400"
          />
        </div>

        {/* Barra única: segmentos abertos (esq) | concluídos (dir) */}
        <SplitBar open={open} done={done} total={total} />

        {/* Detalhe por status, em duas colunas */}
        <div className="grid grid-cols-2 gap-x-4 flex-1 min-h-0 overflow-y-auto">
          <StatusColumn heading="Abertos" items={open} emptyText="Nenhum" />
          <StatusColumn heading="Concluídos" items={done} emptyText="Nenhum" />
        </div>
      </CardContent>
    </Card>
  );
}

function GroupTotal({
  label,
  value,
  total,
  accentClass,
}: {
  label: string;
  value: number;
  total: number;
  accentClass: string;
}) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <div className="flex items-baseline gap-1">
        <span className={cn("text-2xl font-bold leading-none tabular-nums", accentClass)}>
          {value.toLocaleString("pt-BR")}
        </span>
        <span className="text-[10px] tabular-nums text-muted-foreground">
          {pct.toFixed(0)}%
        </span>
      </div>
    </div>
  );
}

function SplitBar({
  open,
  done,
  total,
}: {
  open: ChartDataItem[];
  done: ChartDataItem[];
  total: number;
}) {
  if (total === 0) return null;
  return (
    <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-progress-track flex-shrink-0">
      {open.map((item) => (
        <BarSegment key={item.name} item={item} total={total} />
      ))}
      {open.length > 0 && done.length > 0 && (
        <div className="h-full w-px bg-card flex-shrink-0" aria-hidden />
      )}
      {done.map((item) => (
        <BarSegment key={item.name} item={item} total={total} />
      ))}
    </div>
  );
}

function BarSegment({ item, total }: { item: ChartDataItem; total: number }) {
  const pct = (item.value / total) * 100;
  if (pct === 0) return null;
  return (
    <div
      title={`${item.name}: ${item.value} (${pct.toFixed(1)}%)`}
      aria-label={`${item.name}: ${item.value} chamados`}
      className="h-full transition-opacity hover:opacity-80"
      style={{ width: `${pct}%`, backgroundColor: item.color ?? "#71717a" }}
    />
  );
}

function StatusColumn({
  heading,
  items,
  emptyText,
}: {
  heading: string;
  items: ChartDataItem[];
  emptyText: string;
}) {
  return (
    <div className="min-w-0 flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground flex-shrink-0">
        {heading}
      </span>
      {items.length === 0 ? (
        <span className="py-0.5 text-[10px] text-muted-foreground/70">{emptyText}</span>
      ) : (
        <ul className="flex flex-col gap-0.5">
          {items.map((item) => (
            <li
              key={item.name}
              className="grid grid-cols-[8px_minmax(0,1fr)_auto] items-center gap-1.5 rounded py-0.5 transition-colors hover:bg-muted/40"
            >
              <span
                className="h-2 w-2 rounded-sm"
                style={{ backgroundColor: item.color ?? "#71717a" }}
                aria-hidden
              />
              <span
                className="truncate text-[11px] font-medium text-card-foreground"
                title={item.name}
              >
                {item.name}
              </span>
              <span className="font-mono text-xs font-bold tabular-nums text-card-foreground">
                {item.value}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
