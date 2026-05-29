"use client";

import { Bar, BarChart, LabelList, XAxis, YAxis, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { ChartDataItem } from "@/types/glpi";

interface TicketsByPriorityProps {
  data?: ChartDataItem[];
  loading?: boolean;
}

export function TicketsByPriority({ data, loading }: TicketsByPriorityProps) {
  if (loading || !data) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-1 pt-2 px-3 flex-shrink-0">
          <CardTitle className="text-xs">Chamados por Prioridade</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 px-3 pb-3">
          <Skeleton className="h-full w-full" />
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
        <CardTitle className="text-xs">Chamados por Prioridade</CardTitle>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          em aberto
        </span>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 px-2 pb-2">
        <ChartContainer config={chartConfig} className="h-full w-full aspect-auto">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ left: 4, right: 16, top: 4, bottom: 4 }}
          >
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              width={80}
              fontSize={10}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--color-chart-text)" }}
              interval={0}
            />
            <ChartTooltip
              cursor={{ fill: "var(--color-hover)" }}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="value" name="Chamados" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color || "#AEC43B"} />
              ))}
              <LabelList
                dataKey="value"
                position="right"
                fontSize={11}
                fontWeight={600}
                fill="var(--color-card-fg)"
                offset={6}
                className="tabular-nums"
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
