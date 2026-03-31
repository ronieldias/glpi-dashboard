"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ChartDataItem } from "@/types/glpi";

interface ProjectProgressProps {
  data?: ChartDataItem[];
  loading?: boolean;
}

export function ProjectProgress({ data, loading }: ProjectProgressProps) {
  if (loading || !data) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-0.5 pt-1.5 px-3 flex-shrink-0">
          <CardTitle className="text-xs">Progresso por Projeto</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 px-3 pb-2">
          <Skeleton className="h-full w-full" />
        </CardContent>
      </Card>
    );
  }

  const truncated = data.map((d) => ({
    ...d,
    name: d.name.length > 22 ? d.name.slice(0, 20) + "..." : d.name,
    fullName: d.name,
  }));

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-0.5 pt-1.5 px-3 flex-shrink-0">
        <CardTitle className="text-xs">Progresso por Projeto</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 px-1 pb-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={truncated} layout="vertical" margin={{ left: 0, right: 10, top: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-chart-grid)" />
            <XAxis type="number" domain={[0, 100]} unit="%" fontSize={9} tick={{ fill: "var(--color-chart-text)" }} />
            <YAxis type="category" dataKey="name" width={90} fontSize={8} tick={{ fill: "var(--color-chart-text)" }} interval={0} />
            <Tooltip
              formatter={(value: number) => `${value}%`}
              labelFormatter={(label) => {
                const item = truncated.find((d) => d.name === label);
                return item?.fullName || label;
              }}
              contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)", color: "var(--color-card-fg)" }}
            />
            <Bar dataKey="value" name="Progresso" fill="#AEC43B" radius={[0, 3, 3, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
