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
      <Card className="h-full">
        <CardHeader className="pb-1 pt-3 px-3">
          <CardTitle className="text-xs">Chamados por Prioridade</CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-2">
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-1 pt-3 px-3">
        <CardTitle className="text-xs">Chamados por Prioridade</CardTitle>
      </CardHeader>
      <CardContent className="px-1 pb-2">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} layout="vertical" margin={{ left: 10, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" fontSize={10} />
            <YAxis type="category" dataKey="name" width={80} fontSize={10} />
            <Tooltip />
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
