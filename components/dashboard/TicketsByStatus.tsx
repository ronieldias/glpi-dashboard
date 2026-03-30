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

interface TicketsByStatusProps {
  data?: ChartDataItem[];
  loading?: boolean;
}

export function TicketsByStatus({ data, loading }: TicketsByStatusProps) {
  if (loading || !data) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-1 pt-3 px-3">
          <CardTitle className="text-xs">Status dos Chamados</CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-2">
          <Skeleton className="mx-auto h-[180px] w-[180px] rounded-full" />
        </CardContent>
      </Card>
    );
  }

  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <Card className="h-full">
      <CardHeader className="pb-1 pt-3 px-3">
        <CardTitle className="text-xs">Status dos Chamados</CardTitle>
      </CardHeader>
      <CardContent className="px-1 pb-2">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={70}
              paddingAngle={2}
              dataKey="value"
              nameKey="name"
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color || "#6B7280"} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => [`${value} (${Math.round(value/total*100)}%)`, ""]} />
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
