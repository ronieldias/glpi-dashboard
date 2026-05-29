"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { ChartDataItem } from "@/types/glpi";

interface MttrByPriorityProps {
  data?: ChartDataItem[];
  loading?: boolean;
}

/**
 * Tempo Médio de Resolução (MTTR) por prioridade, em horas. Calculado apenas
 * sobre tickets resolvidos NO MÊS.
 *
 * Análise: prioridades altas devem ter MTTR baixo. Se Muito Alta > Média,
 * o fluxo de priorização está furado.
 */
export function MttrByPriority({ data, loading }: MttrByPriorityProps) {
  if (loading || !data) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-1 pt-2 px-3 flex-shrink-0">
          <CardTitle className="text-xs">MTTR por Prioridade</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 px-3 pb-3">
          <Skeleton className="h-full w-full" />
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-1 pt-2 px-3 flex-shrink-0">
          <CardTitle className="text-xs">MTTR por Prioridade</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 flex items-center justify-center px-3 pb-3">
          <p className="text-[10px] text-muted-foreground">
            Sem resolvidos no mês
          </p>
        </CardContent>
      </Card>
    );
  }

  const chartConfig: ChartConfig = data.reduce<ChartConfig>((acc, item) => {
    acc[item.name] = { label: item.name, color: item.color };
    return acc;
  }, {});

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-1 pt-2 px-3 flex-shrink-0 flex flex-row items-baseline justify-between gap-2">
        <CardTitle className="text-xs">MTTR por Prioridade</CardTitle>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          horas · mês atual
        </span>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 px-2 pb-2">
        <ChartContainer config={chartConfig} className="h-full w-full aspect-auto">
          <BarChart
            data={data}
            margin={{ left: 0, right: 8, top: 8, bottom: 0 }}
          >
            <CartesianGrid
              vertical={false}
              stroke="var(--color-chart-grid)"
              strokeDasharray="3 3"
            />
            <XAxis
              dataKey="name"
              fontSize={10}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--color-chart-text)" }}
            />
            <YAxis
              fontSize={10}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--color-chart-text)" }}
              width={40}
              tickFormatter={(v) => `${v}h`}
            />
            <ChartTooltip
              cursor={{ fill: "var(--color-hover)" }}
              content={
                <ChartTooltipContent
                  formatter={(value) => (
                    <span className="font-mono tabular-nums">{value}h</span>
                  )}
                />
              }
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {data.map((item, idx) => (
                <Cell key={idx} fill={item.color ?? "#AEC43B"} />
              ))}
              <LabelList
                dataKey="value"
                position="top"
                fontSize={11}
                fontWeight={600}
                fill="var(--color-card-fg)"
                offset={4}
                formatter={(v: number) => `${v}h`}
                className="tabular-nums"
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
