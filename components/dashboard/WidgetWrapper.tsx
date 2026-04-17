"use client";

import { useCallback, useRef } from "react";
import { Trash2, GripVertical } from "lucide-react";
import { useDashboardLayout } from "@/hooks/useDashboardLayout";
import { widgetMap } from "@/lib/widget-registry";
import { canPlace } from "@/lib/widget-layout";
import type { WidgetInstance } from "@/types/widget";
import { GRID_COLS, GRID_ROWS } from "@/types/widget";

interface WidgetWrapperProps {
  instance: WidgetInstance;
  children: React.ReactNode;
}

type ResizeDirection = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

function getGridMetrics(gridEl: HTMLElement) {
  const rect = gridEl.getBoundingClientRect();
  const gap = 8; // 0.5rem = 8px
  const cellW = (rect.width - gap * (GRID_COLS - 1)) / GRID_COLS;
  const cellH = (rect.height - gap * (GRID_ROWS - 1)) / GRID_ROWS;
  return { rect, cellW, cellH, gap };
}

export function WidgetWrapper({ instance, children }: WidgetWrapperProps) {
  const { editMode, removeWidget, resizeWidget, layout, setDragGhost, moveWidget } = useDashboardLayout();
  const containerRef = useRef<HTMLDivElement>(null);

  const handleResizeStart = useCallback(
    (direction: ResizeDirection, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const startX = e.clientX;
      const startY = e.clientY;
      const startCol = instance.col;
      const startRow = instance.row;
      const startW = instance.w;
      const startH = instance.h;

      const gridEl = containerRef.current?.parentElement;
      if (!gridEl) return;
      const { cellW, cellH, gap } = getGridMetrics(gridEl);
      const step = { x: cellW + gap, y: cellH + gap };

      const def = widgetMap.get(instance.id);
      if (!def) return;

      const handleMouseMove = (ev: MouseEvent) => {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;

        let newCol = startCol;
        let newRow = startRow;
        let newW = startW;
        let newH = startH;

        // East edge
        if (direction === "e" || direction === "se" || direction === "ne") {
          newW = startW + Math.round(dx / step.x);
        }
        // West edge — moves col and adjusts width
        if (direction === "w" || direction === "sw" || direction === "nw") {
          const colDelta = Math.round(dx / step.x);
          newCol = startCol + colDelta;
          newW = startW - colDelta;
        }
        // South edge
        if (direction === "s" || direction === "se" || direction === "sw") {
          newH = startH + Math.round(dy / step.y);
        }
        // North edge — moves row and adjusts height
        if (direction === "n" || direction === "ne" || direction === "nw") {
          const rowDelta = Math.round(dy / step.y);
          newRow = startRow + rowDelta;
          newH = startH - rowDelta;
        }

        // Clamp size to widget definition limits
        newW = Math.max(def.minW, Math.min(def.maxW, newW));
        newH = Math.max(def.minH, Math.min(def.maxH, newH));

        // Clamp to grid boundaries
        newCol = Math.max(1, newCol);
        newRow = Math.max(1, newRow);
        if (newCol + newW - 1 > GRID_COLS) newW = GRID_COLS - newCol + 1;
        if (newRow + newH - 1 > GRID_ROWS) newH = GRID_ROWS - newRow + 1;

        // Re-clamp in case boundary clamp broke min
        newW = Math.max(def.minW, newW);
        newH = Math.max(def.minH, newH);

        if (
          newCol !== instance.col ||
          newRow !== instance.row ||
          newW !== instance.w ||
          newH !== instance.h
        ) {
          resizeWidget(instance.id, newCol, newRow, newW, newH);
        }
      };

      const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [instance, resizeWidget]
  );

  const handleDragStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const gridEl = containerRef.current?.parentElement;
      if (!gridEl) return;
      const { cellW, cellH, gap } = getGridMetrics(gridEl);
      const step = { x: cellW + gap, y: cellH + gap };

      const startX = e.clientX;
      const startY = e.clientY;
      const startCol = instance.col;
      const startRow = instance.row;

      // Show initial ghost
      setDragGhost({
        id: instance.id,
        col: startCol,
        row: startRow,
        w: instance.w,
        h: instance.h,
        valid: true,
      });

      const handleMouseMove = (ev: MouseEvent) => {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;

        const newCol = startCol + Math.round(dx / step.x);
        const newRow = startRow + Math.round(dy / step.y);

        const candidate = { id: instance.id, col: newCol, row: newRow, w: instance.w, h: instance.h };
        const valid = canPlace(candidate, layout, instance.id);

        setDragGhost({
          id: instance.id,
          col: newCol,
          row: newRow,
          w: instance.w,
          h: instance.h,
          valid,
        });
      };

      const handleMouseUp = (ev: MouseEvent) => {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;

        const newCol = startCol + Math.round(dx / step.x);
        const newRow = startRow + Math.round(dy / step.y);

        moveWidget(instance.id, newCol, newRow);
        setDragGhost(null);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [instance, layout, moveWidget, setDragGhost]
  );

  const handle = "absolute z-20 hover:bg-glpi-primary/30 transition-colors";

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full"
      style={{
        gridColumn: `${instance.col} / span ${instance.w}`,
        gridRow: `${instance.row} / span ${instance.h}`,
      }}
    >
      {/* Widget content */}
      <div className="h-full w-full overflow-hidden">{children}</div>

      {/* Edit mode overlay */}
      {editMode && (
        <>
          {/* Subtle border overlay */}
          <div className="absolute inset-0 border-2 border-dashed border-glpi-primary/40 rounded pointer-events-none z-10" />

          {/* Remove button */}
          <button
            onClick={() => removeWidget(instance.id)}
            className="absolute top-1 right-1 z-20 flex h-5 w-5 items-center justify-center rounded bg-red-500/90 text-white hover:bg-red-600 transition-colors"
            title="Remover widget"
          >
            <Trash2 className="h-3 w-3" />
          </button>

          {/* Drag handle */}
          <div
            onMouseDown={handleDragStart}
            className="absolute top-1 left-1 z-20 flex h-5 w-5 items-center justify-center rounded bg-black/40 text-white/80 cursor-grab active:cursor-grabbing hover:bg-black/60 transition-colors"
            title="Mover widget"
          >
            <GripVertical className="h-3 w-3" />
          </div>

          {/* --- Resize handles (8 directions) --- */}
          {/* North */}
          <div onMouseDown={(e) => handleResizeStart("n", e)} className={`${handle} top-0 left-3 right-3 h-1.5 cursor-n-resize`} />
          {/* South */}
          <div onMouseDown={(e) => handleResizeStart("s", e)} className={`${handle} bottom-0 left-3 right-3 h-1.5 cursor-s-resize`} />
          {/* East */}
          <div onMouseDown={(e) => handleResizeStart("e", e)} className={`${handle} top-3 right-0 bottom-3 w-1.5 cursor-e-resize`} />
          {/* West */}
          <div onMouseDown={(e) => handleResizeStart("w", e)} className={`${handle} top-3 left-0 bottom-3 w-1.5 cursor-w-resize`} />
          {/* NW */}
          <div onMouseDown={(e) => handleResizeStart("nw", e)} className={`${handle} top-0 left-0 h-3 w-3 cursor-nw-resize`} />
          {/* NE */}
          <div onMouseDown={(e) => handleResizeStart("ne", e)} className={`${handle} top-0 right-0 h-3 w-3 cursor-ne-resize`} />
          {/* SW */}
          <div onMouseDown={(e) => handleResizeStart("sw", e)} className={`${handle} bottom-0 left-0 h-3 w-3 cursor-sw-resize`} />
          {/* SE */}
          <div onMouseDown={(e) => handleResizeStart("se", e)} className={`${handle} bottom-0 right-0 h-3 w-3 cursor-se-resize rounded-tl`} />
        </>
      )}
    </div>
  );
}
