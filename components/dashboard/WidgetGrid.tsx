"use client";

import { useState, useMemo } from "react";
import { useDashboardLayout } from "@/hooks/useDashboardLayout";
import { widgetMap } from "@/lib/widget-registry";
import { getEmptyCells } from "@/lib/widget-layout";
import { WidgetWrapper } from "@/components/dashboard/WidgetWrapper";
import { EmptyCell } from "@/components/dashboard/EmptyCell";
import { AddWidgetModal } from "@/components/dashboard/AddWidgetModal";
import { GRID_COLS, GRID_ROWS } from "@/types/widget";

interface WidgetGridProps {
  page: string;
}

export function WidgetGrid({ page }: WidgetGridProps) {
  const { layout, editMode, dragGhost } = useDashboardLayout();
  const [modalOrigin, setModalOrigin] = useState<{ col: number; row: number } | null>(null);

  const emptyCells = useMemo(
    () => (editMode ? getEmptyCells(layout) : []),
    [layout, editMode]
  );

  const handleEmptyCellClick = (col: number, row: number) => {
    setModalOrigin({ col, row });
  };

  return (
    <>
      <div
        className="h-full w-full relative"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${GRID_ROWS}, minmax(0, 1fr))`,
          gap: "0.5rem",
        }}
      >
        {layout.map((instance) => {
          const def = widgetMap.get(instance.id);
          if (!def) return null;
          const Component = def.component;
          return (
            <WidgetWrapper key={instance.id} instance={instance}>
              <Component />
            </WidgetWrapper>
          );
        })}

        {editMode &&
          emptyCells.map(({ col, row }) => (
            <EmptyCell
              key={`empty-${col}-${row}`}
              col={col}
              row={row}
              onClick={handleEmptyCellClick}
            />
          ))}

        {dragGhost && (
          <div
            className={`rounded border-2 border-dashed pointer-events-none z-30 transition-colors ${
              dragGhost.valid
                ? "bg-green-500/15 border-green-500/60"
                : "bg-red-500/15 border-red-500/60"
            }`}
            style={{
              gridColumn: `${dragGhost.col} / span ${dragGhost.w}`,
              gridRow: `${dragGhost.row} / span ${dragGhost.h}`,
            }}
          />
        )}
      </div>

      {modalOrigin && (
        <AddWidgetModal
          page={page}
          col={modalOrigin.col}
          row={modalOrigin.row}
          onClose={() => setModalOrigin(null)}
        />
      )}
    </>
  );
}
