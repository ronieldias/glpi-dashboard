"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ChartDataItem } from "@/types/glpi";

interface TicketsByPriorityProps {
  data?: ChartDataItem[];
  loading?: boolean;
}

export function TicketsByPriority({ data, loading }: TicketsByPriorityProps) {
  if (loading || !data) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-0.5 pt-1.5 px-3 flex-shrink-0">
          <CardTitle className="text-xs">Chamados por Prioridade</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 px-3 pb-2">
          <Skeleton className="h-full w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-0.5 pt-1.5 px-3 flex-shrink-0">
        <CardTitle className="text-xs">Chamados por Prioridade</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 px-1 pb-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 0, right: 10, top: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-chart-grid)" />
            <XAxis type="number" fontSize={9} tick={{ fill: "var(--color-chart-text)" }} />
            <YAxis type="category" dataKey="name" width={70} fontSize={8} tick={{ fill: "var(--color-chart-text)" }} interval={0} />
            <Tooltip contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)", color: "var(--color-card-fg)" }} />
            <Bar dataKey="value" name="Chamados" radius={[0, 3, 3, 0]}>
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color || "#AEC43B"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
