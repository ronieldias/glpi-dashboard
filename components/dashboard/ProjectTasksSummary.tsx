"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface TaskSummaryItem {
  name: string;
  open: number;
  closed: number;
}

interface ProjectTasksSummaryProps {
  data?: TaskSummaryItem[];
  loading?: boolean;
}

export function ProjectTasksSummary({ data, loading }: ProjectTasksSummaryProps) {
  if (loading || !data) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-1 pt-3 px-3">
          <CardTitle className="text-xs">Tarefas Abertas x Concluidas</CardTitle>
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
        <CardTitle className="text-xs">Tarefas Abertas x Concluidas</CardTitle>
      </CardHeader>
      <CardContent className="px-1 pb-2">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} margin={{ left: 10, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" fontSize={8} angle={-15} textAnchor="end" height={40} />
            <YAxis fontSize={10} width={25} />
            <Tooltip />
            <Legend iconSize={8} wrapperStyle={{ fontSize: "10px" }} />
            <Bar dataKey="open" name="Abertas" stackId="a" fill="#EF4444" />
            <Bar dataKey="closed" name="Concluidas" stackId="a" fill="#AEC43B" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
