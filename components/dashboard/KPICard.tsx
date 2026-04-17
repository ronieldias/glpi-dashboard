"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CountUp } from "@/components/ui/count-up";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  highlight?: boolean;
  loading?: boolean;
  delta?: { value: number; label: string };
}

export function KPICard({
  title,
  value,
  icon: Icon,
  description,
  highlight = false,
  loading = false,
  delta,
}: KPICardProps) {
  if (loading) {
    return (
      <Card className="h-full flex flex-col">
        <CardContent className="flex-1 min-h-0 flex items-center justify-center p-2">
          <div className="flex items-center justify-between w-full">
            <div className="space-y-1">
              <Skeleton className="h-2.5 w-16" />
              <Skeleton className="h-5 w-10" />
            </div>
            <Skeleton className="h-6 w-6 rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "h-full flex flex-col transition-shadow hover:shadow-md",
        highlight &&
          "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950",
      )}
    >
      <CardContent className="flex-1 min-h-0 flex items-center justify-center p-2">
        <div className="flex items-center justify-between w-full">
          <div>
            <p className="text-[9px] font-medium text-muted uppercase tracking-wider leading-none">
              {title}
            </p>
            <p
              className={cn(
                "mt-0.5 text-lg font-bold leading-tight tabular-nums",
                highlight
                  ? "text-red-600 dark:text-red-400"
                  : "text-card-foreground",
              )}
            >
              {typeof value === "number" ? <CountUp to={value} /> : value}
            </p>
            {delta && delta.value > 0 && (
              <p className="text-[9px] font-medium leading-none text-glpi-primary tabular-nums">
                +{delta.value} {delta.label}
              </p>
            )}
            {description && (
              <p className="text-[8px] text-muted-foreground leading-none">
                {description}
              </p>
            )}
          </div>
          <div
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded shrink-0",
              highlight
                ? "bg-red-100 dark:bg-red-900/50"
                : "bg-glpi-primary/10",
            )}
          >
            <Icon
              className={cn(
                "h-3.5 w-3.5",
                highlight
                  ? "text-red-600 dark:text-red-400"
                  : "text-glpi-primary",
              )}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
