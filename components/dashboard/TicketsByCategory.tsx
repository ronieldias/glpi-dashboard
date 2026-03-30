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

interface TicketsByCategoryProps {
  data?: ChartDataItem[];
  loading?: boolean;
}

export function TicketsByCategory({ data, loading }: TicketsByCategoryProps) {
  if (loading || !data) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-1 pt-3 px-3">
          <CardTitle className="text-xs">Top 10 Categorias</CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-2">
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    );
  }

  // Truncar nomes longos
  const truncated = data.map((d) => ({
    ...d,
    name: d.name.length > 20 ? d.name.slice(0, 18) + "..." : d.name,
    fullName: d.name,
  }));

  return (
    <Card className="h-full">
      <CardHeader className="pb-1 pt-3 px-3">
        <CardTitle className="text-xs">Top 10 Categorias</CardTitle>
      </CardHeader>
      <CardContent className="px-1 pb-2">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={truncated} layout="vertical" margin={{ left: 10, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" fontSize={10} />
            <YAxis type="category" dataKey="name" width={110} fontSize={9} tick={{ fill: "#374151" }} />
            <Tooltip
              formatter={(value: number) => [value, "Chamados"]}
              labelFormatter={(label) => {
                const item = truncated.find((d) => d.name === label);
                return item?.fullName || label;
              }}
            />
            <Bar dataKey="value" name="Chamados" fill="#8B5CF6" radius={[0, 3, 3, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
