import type { WidgetInstance, PageLayout } from "@/types/widget";
import { GRID_COLS, GRID_ROWS } from "@/types/widget";
import { widgetMap } from "@/lib/widget-registry";

const STORAGE_PREFIX = "dashboard-layout:v3:";

export const defaultLayouts: Record<string, PageLayout> = {
  "/dashboard": [
    { id: "kpi-tickets-open", col: 1, row: 1, w: 2, h: 1 },
    { id: "kpi-unassigned", col: 3, row: 1, w: 2, h: 1 },
    { id: "kpi-oldest-open", col: 5, row: 1, w: 2, h: 1 },
    { id: "kpi-sla-critical", col: 7, row: 1, w: 2, h: 1 },
    { id: "kpi-sla-today", col: 9, row: 1, w: 2, h: 1 },
    { id: "tickets-recent", col: 11, row: 1, w: 2, h: 8 },
    { id: "tickets-by-status", col: 1, row: 2, w: 4, h: 3 },
    { id: "current-load", col: 5, row: 2, w: 3, h: 3 },
    { id: "mttr-priority", col: 8, row: 2, w: 3, h: 3 },
    { id: "backlog-by-age", col: 1, row: 5, w: 10, h: 2 },
    { id: "tickets-trend", col: 1, row: 7, w: 6, h: 2 },
    { id: "projects-by-status", col: 7, row: 7, w: 4, h: 2 },
  ],

  "/dashboard/tickets": [
    { id: "kpi-tickets-open", col: 1, row: 1, w: 2, h: 1 },
    { id: "kpi-unassigned", col: 3, row: 1, w: 2, h: 1 },
    { id: "kpi-oldest-open", col: 5, row: 1, w: 2, h: 1 },
    { id: "kpi-sla-critical", col: 7, row: 1, w: 2, h: 1 },
    { id: "kpi-sla-today", col: 9, row: 1, w: 2, h: 1 },
    { id: "tickets-recent", col: 11, row: 1, w: 2, h: 8 },
    { id: "tickets-by-status", col: 1, row: 2, w: 3, h: 3 },
    { id: "tickets-by-priority", col: 4, row: 2, w: 3, h: 3 },
    { id: "current-load", col: 7, row: 2, w: 4, h: 3 },
    { id: "tickets-trend", col: 1, row: 5, w: 6, h: 2 },
    { id: "mttr-priority", col: 7, row: 5, w: 4, h: 2 },
    { id: "tickets-by-category", col: 1, row: 7, w: 6, h: 2 },
    { id: "tickets-by-technician", col: 7, row: 7, w: 4, h: 2 },
  ],

  "/dashboard/projects": [
    { id: "kpi-projects-active", col: 1, row: 1, w: 3, h: 1 },
    { id: "kpi-projects-done", col: 4, row: 1, w: 3, h: 1 },
    { id: "kpi-overdue", col: 7, row: 1, w: 3, h: 1 },
    { id: "kpi-tasks-open", col: 10, row: 1, w: 3, h: 1 },
    { id: "projects-by-status", col: 1, row: 2, w: 6, h: 3 },
    { id: "projects-progress", col: 7, row: 2, w: 6, h: 3 },
    { id: "projects-tasks-summary", col: 1, row: 5, w: 6, h: 3 },
    { id: "projects-timeline", col: 7, row: 5, w: 6, h: 3 },
    { id: "projects-table", col: 1, row: 8, w: 12, h: 1 },
  ],
};

export function loadLayout(page: string): PageLayout {
  if (typeof window === "undefined") return defaultLayouts[page] ?? [];
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + page);
    if (raw) {
      const parsed = JSON.parse(raw) as PageLayout;
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
  }
  return defaultLayouts[page] ?? [];
}

export function saveLayout(page: string, layout: PageLayout): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_PREFIX + page, JSON.stringify(layout));
  } catch {
  }
}

function rectsOverlap(a: WidgetInstance, b: WidgetInstance): boolean {
  const aRight = a.col + a.w;
  const aBottom = a.row + a.h;
  const bRight = b.col + b.w;
  const bBottom = b.row + b.h;
  return a.col < bRight && aRight > b.col && a.row < bBottom && aBottom > b.row;
}

export function hasCollision(
  widget: WidgetInstance,
  layout: PageLayout,
  excludeId?: string
): boolean {
  return layout.some(
    (other) => other.id !== excludeId && rectsOverlap(widget, other)
  );
}

export function isWithinGrid(widget: WidgetInstance): boolean {
  return (
    widget.col >= 1 &&
    widget.row >= 1 &&
    widget.col + widget.w - 1 <= GRID_COLS &&
    widget.row + widget.h - 1 <= GRID_ROWS
  );
}

export function canPlace(
  widget: WidgetInstance,
  layout: PageLayout,
  excludeId?: string
): boolean {
  return isWithinGrid(widget) && !hasCollision(widget, layout, excludeId);
}

export function clampSize(
  widgetId: string,
  w: number,
  h: number
): { w: number; h: number } {
  const def = widgetMap.get(widgetId);
  if (!def) return { w, h };
  return {
    w: Math.max(def.minW, Math.min(def.maxW, w)),
    h: Math.max(def.minH, Math.min(def.maxH, h)),
  };
}

export function getOccupiedCells(layout: PageLayout): Set<string> {
  const occupied = new Set<string>();
  for (const widget of layout) {
    for (let c = widget.col; c < widget.col + widget.w; c++) {
      for (let r = widget.row; r < widget.row + widget.h; r++) {
        occupied.add(`${c},${r}`);
      }
    }
  }
  return occupied;
}

export function getEmptyCells(layout: PageLayout): Array<{ col: number; row: number }> {
  const occupied = getOccupiedCells(layout);
  const empty: Array<{ col: number; row: number }> = [];
  for (let r = 1; r <= GRID_ROWS; r++) {
    for (let c = 1; c <= GRID_COLS; c++) {
      if (!occupied.has(`${c},${r}`)) {
        empty.push({ col: c, row: r });
      }
    }
  }
  return empty;
}
