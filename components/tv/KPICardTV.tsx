import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardTVProps {
  label: string;
  value: number | string;
  /** Sufixo opcional ao lado do valor (ex: "h", "%", "dias"). */
  unit?: string;
  /** Ícone à esquerda do label. */
  icon?: LucideIcon;
  /** Tom semântico: usado APENAS no número/ícone e numa barra fina inferior.
   * O resto do card permanece neutro (estilo Linear). */
  tone?: "neutral" | "good" | "warn" | "bad" | "critical";
  /** Comparativo opcional (ex: "+12 vs ontem", "78% ontem"). */
  delta?: string;
}

const TONE_ACCENT: Record<NonNullable<KPICardTVProps["tone"]>, string> = {
  neutral: "text-zinc-100",
  good: "text-emerald-400",
  warn: "text-amber-400",
  bad: "text-orange-400",
  critical: "text-red-400",
};

const TONE_BAR: Record<NonNullable<KPICardTVProps["tone"]>, string> = {
  neutral: "bg-zinc-700/40",
  good: "bg-emerald-500/70",
  warn: "bg-amber-500/70",
  bad: "bg-orange-500/70",
  critical: "bg-red-500/80",
};

const TONE_ICON: Record<NonNullable<KPICardTVProps["tone"]>, string> = {
  neutral: "text-zinc-500",
  good: "text-emerald-500",
  warn: "text-amber-500",
  bad: "text-orange-500",
  critical: "text-red-500",
};

/**
 * Card de KPI estilo Linear/Apple: superfície neutra com 1 borda sutil,
 * tipografia hierárquica clara, e tom semântico aplicado APENAS ao número
 * (não ao card inteiro). Visual silencioso em estado bom, fica perceptível
 * só quando há algo importante.
 */
export function KPICardTV({
  label,
  value,
  unit,
  icon: Icon,
  tone = "neutral",
  delta,
}: KPICardTVProps) {
  const isCritical = tone === "critical";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border bg-zinc-950/40 px-5 py-4",
        "border-zinc-800/80",
        isCritical && "tv-critical-glow border-red-500/40",
      )}
    >
      <div className="flex items-center gap-2">
        {Icon && (
          <Icon
            className={cn("h-3.5 w-3.5 shrink-0", TONE_ICON[tone])}
            aria-hidden
          />
        )}
        <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500">
          {label}
        </span>
      </div>

      <div className="mt-3 flex items-baseline gap-1.5">
        <span
          className={cn(
            "text-4xl font-semibold tabular-nums leading-none tracking-tight",
            TONE_ACCENT[tone],
          )}
        >
          {value}
        </span>
        {unit && (
          <span className="text-base font-medium text-zinc-500">{unit}</span>
        )}
      </div>

      {delta && (
        <p className="mt-2 text-xs text-zinc-500">{delta}</p>
      )}

      {/* Barra inferior de tom — único ponto de cor permanente do card */}
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 h-[2px]",
          TONE_BAR[tone],
        )}
        aria-hidden
      />
    </div>
  );
}
