"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CountUp } from "@/components/ui/count-up";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Info, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  /** Descrição curta (aparece como texto pequeno OU tooltip em ícone "i"). */
  description?: string;
  /** Modo crítico: borda + texto em tom de alerta. */
  highlight?: boolean;
  loading?: boolean;
  /** Comparativo (ex: "+12 hoje"). */
  delta?: { value: number; label: string };
}

/**
 * KPI Card — shadcn-style refinado:
 * - Hierarquia clara: label > valor > delta/desc
 * - Hover sutil (shadow + leve translate)
 * - Tooltip no ícone "i" pra descrições longas
 * - Highlight crítico: borda colorida + ring + valor em vermelho
 * - CountUp animado pra valores numéricos (continua compatível)
 */
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
      <Card className="h-full">
        <CardContent className="flex h-full flex-col justify-between p-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-6 w-6 rounded-md" />
          </div>
          <Skeleton className="h-7 w-16" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "group relative h-full overflow-hidden border bg-card transition-all",
        "hover:border-glpi-primary/40 hover:shadow-sm",
        // Highlight sutil: só borda + barra fina lateral, sem manchão de fundo.
        highlight && "border-red-500/30",
      )}
    >
      {/* Barra vertical lateral de alerta — discreta, não polui o card */}
      {highlight && (
        <span
          className="absolute inset-y-0 left-0 w-0.5 bg-red-500/70"
          aria-hidden
        />
      )}
      <CardContent className="flex h-full flex-col justify-between gap-1.5 p-3">
        {/* Top: label + icon */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1">
            <p className="truncate text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
              {title}
            </p>
            {description && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-label={`Sobre ${title}`}
                    className="shrink-0 text-muted-foreground/40 transition-colors hover:text-muted-foreground"
                  >
                    <Info className="h-2.5 w-2.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-[200px]">
                  <p>{description}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          <div
            className={cn(
              "flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition-colors",
              highlight
                ? "bg-red-500/10 text-red-400"
                : "bg-glpi-primary/10 text-glpi-primary group-hover:bg-glpi-primary/15",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
          </div>
        </div>

        {/* Bottom: value + delta */}
        <div className="flex items-end justify-between gap-2">
          <p
            className={cn(
              "text-2xl font-bold leading-none tabular-nums tracking-tight",
              highlight ? "text-red-400" : "text-card-foreground",
            )}
          >
            {typeof value === "number" ? <CountUp to={value} /> : value}
          </p>
          {delta && delta.value > 0 && (
            <span className="inline-flex items-center gap-0.5 text-[10px] font-medium leading-none text-glpi-primary tabular-nums">
              <TrendingUp className="h-2.5 w-2.5" />
              +{delta.value} {delta.label}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
