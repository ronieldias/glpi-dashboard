"use client";

import { Plus } from "lucide-react";

interface EmptyCellProps {
  col: number;
  row: number;
  onClick: (col: number, row: number) => void;
}

export function EmptyCell({ col, row, onClick }: EmptyCellProps) {
  return (
    <div
      className="flex items-center justify-center border border-dashed border-[var(--color-border)] rounded bg-card/30 hover:bg-card/60 hover:border-glpi-primary/40 transition-colors cursor-pointer"
      style={{
        gridColumn: `${col} / span 1`,
        gridRow: `${row} / span 1`,
      }}
      onClick={() => onClick(col, row)}
    >
      <Plus className="h-4 w-4 text-muted/50" />
    </div>
  );
}
