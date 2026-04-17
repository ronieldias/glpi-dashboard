"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CountUp } from "@/components/ui/count-up";
import { cn } from "@/lib/utils";

interface BacklogByAgeData {
  today: number;
  week: number;
  month: number;
  older: number;
  total: number;
}

interface BacklogByAgeProps {
  data?: BacklogByAgeData;
  loading?: boolean;
}

const BUCKETS: Array<{
  key: keyof Omit<BacklogByAgeData, "total">;
  label: string;
  color: string;
  barClass: string;
}> = [
  {
    key: "today",
    label: "< 1 dia",
    color: "#AEC43B",
    barClass: "bg-[#AEC43B]",
  },
  {
    key: "week",
    label: "1 – 7 dias",
    color: "#60A5FA",
    barClass: "bg-[#60A5FA]",
  },
  {
    key: "month",
    label: "7 – 30 dias",
    color: "#F59E0B",
    barClass: "bg-[#F59E0B]",
  },
  {
    key: "older",
    label: "> 30 dias",
    color: "#EF4444",
    barClass: "bg-[#EF4444]",
  },
];

export function BacklogByAge({ data, loading }: BacklogByAgeProps) {
  if (loading || !data) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-0.5 pt-1.5 px-3 flex-shrink-0">
          <CardTitle className="text-xs">Backlog por Idade</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 px-3 pb-2">
          <div className="space-y-1.5">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-3 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const max = Math.max(data.today, data.week, data.month, data.older, 1);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-0.5 pt-1.5 px-3 flex-shrink-0">
        <CardTitle className="text-xs flex items-center justify-between">
          <span>Backlog por Idade</span>
          <span className="text-[9px] text-muted-foreground tabular-nums">
            <CountUp to={data.total} /> abertos
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 px-3 pb-2 flex flex-col justify-center gap-1">
        {BUCKETS.map((bucket) => {
          const value = data[bucket.key];
          const pct = max > 0 ? (value / max) * 100 : 0;
          return (
            <div
              key={bucket.key}
              className="flex items-center gap-2 text-[10px]"
            >
              <span className="w-[68px] shrink-0 text-muted-foreground tabular-nums">
                {bucket.label}
              </span>
              <div className="flex-1 h-2 rounded-full bg-muted/30 overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    bucket.barClass,
                  )}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-6 text-right font-semibold tabular-nums text-card-foreground">
                <CountUp to={value} />
              </span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
