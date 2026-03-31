"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  highlight?: boolean;
  loading?: boolean;
}

export function KPICard({
  title,
  value,
  icon: Icon,
  description,
  highlight = false,
  loading = false,
}: KPICardProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-2">
          <div className="flex items-center justify-between">
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
        "transition-shadow hover:shadow-md",
        highlight && "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950"
      )}
    >
      <CardContent className="p-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[9px] font-medium text-muted uppercase tracking-wider leading-none">{title}</p>
            <p className={cn("mt-0.5 text-lg font-bold leading-tight", highlight ? "text-red-600 dark:text-red-400" : "text-card-foreground")}>
              {value}
            </p>
            {description && <p className="text-[8px] text-muted-foreground leading-none">{description}</p>}
          </div>
          <div className={cn("flex h-6 w-6 items-center justify-center rounded", highlight ? "bg-red-100 dark:bg-red-900/50" : "bg-glpi-primary/10")}>
            <Icon className={cn("h-3.5 w-3.5", highlight ? "text-red-600 dark:text-red-400" : "text-glpi-primary")} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
