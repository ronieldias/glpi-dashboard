"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { TrendDataItem } from "@/types/glpi";

interface TicketsTrendProps {
  data?: TrendDataItem[];
  loading?: boolean;
}

export function TicketsTrend({ data, loading }: TicketsTrendProps) {
  if (loading || !data) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-0.5 pt-1.5 px-3 flex-shrink-0">
          <CardTitle className="text-xs">Volume por Periodo</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 px-3 pb-2">
          <Skeleton className="h-full w-full" />
        </CardContent>
      </Card>
    );
  }

  const len = data.length;
  const interval = len <= 7 ? 0 : len <= 30 ? 4 : Math.floor(len / 10);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-0.5 pt-1.5 px-3 flex-shrink-0">
        <CardTitle className="text-xs">Volume por Periodo</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 px-1 pb-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: 0, right: 10, top: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-chart-grid)" />
            <XAxis dataKey="date" fontSize={8} interval={interval} tick={{ fill: "var(--color-chart-text)" }} />
            <YAxis fontSize={9} width={25} tick={{ fill: "var(--color-chart-text)" }} />
            <Tooltip contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)", color: "var(--color-card-fg)" }} />
            <Legend iconSize={8} wrapperStyle={{ fontSize: "9px", paddingTop: 0 }} />
            <Line type="monotone" dataKey="opened" name="Abertos" stroke="#EF4444" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="closed" name="Fechados" stroke="#AEC43B" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
