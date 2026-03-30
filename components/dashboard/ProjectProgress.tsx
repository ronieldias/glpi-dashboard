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
      <Card className="h-full">
        <CardHeader className="pb-1 pt-3 px-3">
          <CardTitle className="text-xs">Progresso por Projeto</CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-2">
          <Skeleton className="h-[200px] w-full" />
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
    <Card className="h-full">
      <CardHeader className="pb-1 pt-3 px-3">
        <CardTitle className="text-xs">Progresso por Projeto</CardTitle>
      </CardHeader>
      <CardContent className="px-1 pb-2">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={truncated} layout="vertical" margin={{ left: 10, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" domain={[0, 100]} unit="%" fontSize={10} />
            <YAxis type="category" dataKey="name" width={120} fontSize={9} />
            <Tooltip
              formatter={(value: number) => `${value}%`}
              labelFormatter={(label) => {
                const item = truncated.find((d) => d.name === label);
                return item?.fullName || label;
              }}
            />
            <Bar dataKey="value" name="Progresso" fill="#AEC43B" radius={[0, 3, 3, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
