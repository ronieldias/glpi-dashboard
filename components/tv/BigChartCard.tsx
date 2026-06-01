import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BigChartCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  rightSlot?: ReactNode;
}

export function BigChartCard({
  title,
  subtitle,
  children,
  className,
  rightSlot,
}: BigChartCardProps) {
  return (
    <div
      className={cn(
        "flex h-full flex-col rounded-lg border border-zinc-800/80 bg-zinc-950/40",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-zinc-800/60 px-5 py-3">
        <div className="flex items-baseline gap-2">
          <h2 className="text-sm font-semibold tracking-tight text-zinc-100">
            {title}
          </h2>
          {subtitle && (
            <span className="text-xs text-zinc-500">{subtitle}</span>
          )}
        </div>
        {rightSlot}
      </div>
      <div className="min-h-0 flex-1 p-4">{children}</div>
    </div>
  );
}
