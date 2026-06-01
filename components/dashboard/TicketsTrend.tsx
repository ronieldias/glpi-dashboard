"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { TrendDataItem } from "@/types/glpi";

interface TicketsTrendProps {
  data?: TrendDataItem[];
  loading?: boolean;
}

const chartConfig: ChartConfig = {
  opened: { label: "Abertos", color: "#F59E0B" },
  closed: { label: "Fechados", color: "#10B981" },
};

export function TicketsTrend({ data, loading }: TicketsTrendProps) {
  if (loading || !data) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-1 pt-2 px-3 flex-shrink-0">
          <CardTitle className="text-xs">Volume por Período</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 px-3 pb-3">
          <Skeleton className="h-full w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-1 pt-2 px-3 flex-shrink-0 flex flex-row items-baseline justify-between gap-2">
        <CardTitle className="text-xs">Volume por Período</CardTitle>
        <div className="flex items-center gap-3 text-[10px] uppercase tracking-wider text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <span className="inline-block h-1.5 w-3 rounded-full bg-amber-500" />
            Abertos
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="inline-block h-1.5 w-3 rounded-full bg-emerald-500" />
            Fechados
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 px-2 pb-2">
        <ChartContainer config={chartConfig} className="h-full w-full aspect-auto">
          <AreaChart
            data={data}
            margin={{ left: 4, right: 12, top: 8, bottom: 0 }}
          >
            <defs>
              <linearGradient id="trendOpened" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="trendClosed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              stroke="var(--color-chart-grid)"
              strokeDasharray="3 3"
            />
            <XAxis
              dataKey="date"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--color-chart-text)" }}
              interval="preserveStartEnd"
              minTickGap={24}
            />
            <YAxis
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--color-chart-text)" }}
              width={24}
            />
            <ChartTooltip
              cursor={{ stroke: "var(--color-border)", strokeWidth: 1 }}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Area
              type="monotone"
              dataKey="opened"
              name="Abertos"
              stroke="#F59E0B"
              fill="url(#trendOpened)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="closed"
              name="Fechados"
              stroke="#10B981"
              fill="url(#trendClosed)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
