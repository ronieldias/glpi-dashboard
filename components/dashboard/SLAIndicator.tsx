"use client";

import { Cell, Label, Pie, PieChart } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { ChartDataItem } from "@/types/glpi";

interface SLAIndicatorProps {
  data?: ChartDataItem[];
  loading?: boolean;
}

/**
 * Atenção: apesar do nome do componente, este widget mostra a distribuição
 * "Incidentes vs Requisições" (campo type do ticket). Refatoração mecânica
 * agora trocou só o visual; lógica antiga preservada.
 */
export function SLAIndicator({ data, loading }: SLAIndicatorProps) {
  if (loading || !data) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-1 pt-2 px-3 flex-shrink-0">
          <CardTitle className="text-xs">Incidentes vs Requisições</CardTitle>
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
          <CardTitle className="text-xs">Incidentes vs Requisições</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 flex items-center justify-center px-3 pb-3">
          <p className="text-[10px] text-muted-foreground">Sem dados</p>
        </CardContent>
      </Card>
    );
  }

  const total = data.reduce((s, d) => s + d.value, 0);
  const chartConfig: ChartConfig = data.reduce<ChartConfig>((acc, item) => {
    acc[item.name] = { label: item.name, color: item.color };
    return acc;
  }, {});

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-1 pt-2 px-3 flex-shrink-0 flex flex-row items-baseline justify-between gap-2">
        <CardTitle className="text-xs">Incidentes vs Requisições</CardTitle>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground tabular-nums">
          {total} total
        </span>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 flex flex-col gap-1.5 px-3 pb-2">
        <div className="flex-1 min-h-0">
          <ChartContainer config={chartConfig} className="h-full w-full aspect-square mx-auto max-h-[180px]">
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={42}
                outerRadius={62}
                paddingAngle={2}
                strokeWidth={0}
              >
                {data.map((entry, index) => (
                  <Cell key={index} fill={entry.color || "#6B7280"} />
                ))}
                <Label
                  content={({ viewBox }) => {
                    if (
                      !viewBox ||
                      !("cx" in viewBox) ||
                      !("cy" in viewBox)
                    )
                      return null;
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-card-foreground text-xl font-bold tabular-nums"
                        >
                          {total}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy as number) + 14}
                          className="fill-muted-foreground text-[9px] uppercase tracking-wider"
                        >
                          tickets
                        </tspan>
                      </text>
                    );
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
          {data.map((item) => (
            <div
              key={item.name}
              className="inline-flex items-center gap-1 text-[10px]"
            >
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ background: item.color || "#6B7280" }}
                aria-hidden
              />
              <span className="text-muted-foreground">{item.name}</span>
              <span className="font-mono font-semibold tabular-nums text-card-foreground">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
