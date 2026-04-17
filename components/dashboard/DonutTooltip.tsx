"use client";

interface DonutTooltipProps {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: number;
    payload?: { name?: string; color?: string; fill?: string };
  }>;
  total: number;
}

export function DonutTooltip({ active, payload, total }: DonutTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  const slice = payload[0];
  const name = slice.name ?? slice.payload?.name ?? "";
  const value = slice.value ?? 0;
  const color = slice.payload?.color ?? slice.payload?.fill ?? "#6B7280";
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div
      className="rounded border px-2 py-1.5 shadow-md"
      style={{
        backgroundColor: "var(--color-card)",
        borderColor: "var(--color-border)",
        color: "var(--color-card-fg)",
      }}
    >
      <div className="flex items-center gap-1.5">
        <span
          className="inline-block h-2.5 w-2.5 flex-shrink-0 rounded-sm"
          style={{ backgroundColor: color }}
        />
        <span className="text-[11px] font-medium">{name}</span>
      </div>
      <div className="mt-0.5 flex items-baseline gap-1.5 pl-4">
        <span className="text-sm font-semibold tabular-nums">{value}</span>
        <span className="text-[10px] opacity-70 tabular-nums">
          ({percent}%)
        </span>
      </div>
    </div>
  );
}
