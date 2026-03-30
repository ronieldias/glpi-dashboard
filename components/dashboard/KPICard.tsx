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
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-6 w-12" />
            </div>
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "transition-shadow hover:shadow-md",
        highlight && "border-red-200 bg-red-50"
      )}
    >
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">{title}</p>
            <p className={cn("mt-0.5 text-2xl font-bold", highlight ? "text-red-600" : "text-gray-900")}>
              {value}
            </p>
            {description && <p className="text-[9px] text-gray-400">{description}</p>}
          </div>
          <div className={cn("flex h-8 w-8 items-center justify-center rounded-md", highlight ? "bg-red-100" : "bg-glpi-primary/10")}>
            <Icon className={cn("h-4 w-4", highlight ? "text-red-600" : "text-glpi-primary")} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
