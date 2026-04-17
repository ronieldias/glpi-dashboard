"use client";

import { createContext, useState, useCallback, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import type { WidgetInstance, PageLayout } from "@/types/widget";
import { loadLayout, saveLayout, canPlace, clampSize, defaultLayouts } from "@/lib/widget-layout";
import { widgetMap } from "@/lib/widget-registry";

export interface DragGhost {
  id: string;
  col: number;
  row: number;
  w: number;
  h: number;
  valid: boolean;
}

export interface DashboardContextValue {
  layout: PageLayout;
  editMode: boolean;
  enterEditMode: () => void;
  saveEdits: () => void;
  cancelEdits: () => void;
  addWidget: (widgetId: string, col: number, row: number) => boolean;
  removeWidget: (widgetId: string) => void;
  resizeWidget: (widgetId: string, col: number, row: number, w: number, h: number) => boolean;
  moveWidget: (widgetId: string, col: number, row: number) => boolean;
  resetLayout: (page: string) => void;
  dragGhost: DragGhost | null;
  setDragGhost: (ghost: DragGhost | null) => void;
}

export const DashboardContext = createContext<DashboardContextValue | null>(null);

interface DashboardProviderProps {
  page: string;
  children: ReactNode;
}

export function DashboardProvider({ page, children }: DashboardProviderProps) {
  // Start with default layout to match server render, then hydrate from localStorage
  const [layout, setLayout] = useState<PageLayout>(() => defaultLayouts[page] ?? []);
  const [editMode, setEditMode] = useState(false);
  const [dragGhost, setDragGhost] = useState<DragGhost | null>(null);
  const snapshotRef = useRef<PageLayout | null>(null);
  const currentPage = useRef(page);
  const hydrated = useRef(false);

  // Hydrate from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    if (!hydrated.current) {
      hydrated.current = true;
      const saved = loadLayout(page);
      setLayout(saved);
    }
  }, [page]);

  // Reload layout when page changes
  useEffect(() => {
    if (currentPage.current !== page) {
      currentPage.current = page;
      setLayout(loadLayout(page));
      setEditMode(false);
      snapshotRef.current = null;
    }
  }, [page]);

  const enterEditMode = useCallback(() => {
    snapshotRef.current = layout.map((w) => ({ ...w }));
    setEditMode(true);
  }, [layout]);

  const saveEdits = useCallback(() => {
    saveLayout(page, layout);
    snapshotRef.current = null;
    setEditMode(false);
  }, [layout, page]);

  const cancelEdits = useCallback(() => {
    if (snapshotRef.current) {
      setLayout(snapshotRef.current);
    }
    snapshotRef.current = null;
    setEditMode(false);
  }, []);

  const addWidget = useCallback(
    (widgetId: string, col: number, row: number): boolean => {
      const def = widgetMap.get(widgetId);
      if (!def) return false;

      const instance: WidgetInstance = {
        id: widgetId,
        col,
        row,
        w: def.defaultW,
        h: def.defaultH,
      };

      if (layout.some((w) => w.id === widgetId)) return false;
      if (!canPlace(instance, layout)) return false;

      setLayout((prev) => [...prev, instance]);
      return true;
    },
    [layout]
  );

  const removeWidget = useCallback((widgetId: string) => {
    setLayout((prev) => prev.filter((w) => w.id !== widgetId));
  }, []);

  const resizeWidget = useCallback(
    (widgetId: string, col: number, row: number, w: number, h: number): boolean => {
      const existing = layout.find((wi) => wi.id === widgetId);
      if (!existing) return false;

      const clamped = clampSize(widgetId, w, h);
      const resized: WidgetInstance = { ...existing, col, row, w: clamped.w, h: clamped.h };

      if (!canPlace(resized, layout, widgetId)) return false;

      setLayout((prev) =>
        prev.map((wi) => (wi.id === widgetId ? resized : wi))
      );
      return true;
    },
    [layout]
  );

  const moveWidget = useCallback(
    (widgetId: string, col: number, row: number): boolean => {
      const existing = layout.find((wi) => wi.id === widgetId);
      if (!existing) return false;

      const moved: WidgetInstance = { ...existing, col, row };
      if (!canPlace(moved, layout, widgetId)) return false;

      setLayout((prev) =>
        prev.map((wi) => (wi.id === widgetId ? moved : wi))
      );
      return true;
    },
    [layout]
  );

  const resetLayout = useCallback((p: string) => {
    setLayout(defaultLayouts[p] ?? []);
  }, []);

  return (
    <DashboardContext.Provider
      value={{
        layout,
        editMode,
        enterEditMode,
        saveEdits,
        cancelEdits,
        addWidget,
        removeWidget,
        resizeWidget,
        moveWidget,
        resetLayout,
        dragGhost,
        setDragGhost,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}
