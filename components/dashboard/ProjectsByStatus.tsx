"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ChartDataItem } from "@/types/glpi";

interface ProjectsByStatusProps {
  data?: ChartDataItem[];
  loading?: boolean;
}

export function ProjectsByStatus({ data, loading }: ProjectsByStatusProps) {
  if (loading || !data) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-0.5 pt-1.5 px-3">
          <CardTitle className="text-xs">Status dos Projetos</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 px-3 pb-2">
          <Skeleton className="h-full w-full" />
        </CardContent>
      </Card>
    );
  }

  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-0.5 pt-1.5 px-3">
        <CardTitle className="text-xs">Status dos Projetos</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 px-1 pb-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              innerRadius="30%"
              outerRadius="55%"
              paddingAngle={2}
              dataKey="value"
              nameKey="name"
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color || "#6B7280"} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => [`${value} (${Math.round(value/total*100)}%)`, ""]} contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)", color: "var(--color-card-fg)" }} />
            <Legend
              iconSize={8}
              wrapperStyle={{ fontSize: "10px" }}
              formatter={(value: string) => {
                const item = data.find((d) => d.name === value);
                return `${value}: ${item?.value || 0}`;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
