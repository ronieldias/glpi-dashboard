"use client";

import { useState } from "react";
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
  data7?: TrendDataItem[];
  data30?: TrendDataItem[];
  data90?: TrendDataItem[];
  loading?: boolean;
}

export function TicketsTrend({ data7, data30, data90, loading }: TicketsTrendProps) {
  const [period, setPeriod] = useState<7 | 30 | 90>(30);

  const dataMap: Record<number, TrendDataItem[] | undefined> = { 7: data7, 30: data30, 90: data90 };
  const data = dataMap[period];

  if (loading || !data) {
    return (
      <Card>
        <CardHeader className="pb-1 pt-3 px-3">
          <CardTitle className="text-xs">Volume por Periodo</CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-2">
          <Skeleton className="h-[180px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3 px-3">
        <CardTitle className="text-xs">Volume por Periodo</CardTitle>
        <div className="flex gap-1">
          {([7, 30, 90] as const).map((d) => (
            <button
              key={d}
              onClick={() => setPeriod(d)}
              className={`rounded px-2 py-0.5 text-[10px] font-medium transition-colors ${
                period === d
                  ? "bg-glpi-primary text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="px-1 pb-2">
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" fontSize={9} interval={period === 7 ? 0 : period === 30 ? 4 : 10} />
            <YAxis fontSize={10} width={30} />
            <Tooltip />
            <Legend iconSize={8} wrapperStyle={{ fontSize: "10px" }} />
            <Line type="monotone" dataKey="opened" name="Abertos" stroke="#EF4444" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="closed" name="Fechados" stroke="#AEC43B" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
