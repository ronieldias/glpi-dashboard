"use client";

import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { useDashboardLayout } from "@/hooks/useDashboardLayout";
import { getWidgetsForPage } from "@/lib/widget-registry";
import { canPlace } from "@/lib/widget-layout";
import { widgetMap } from "@/lib/widget-registry";
import type { WidgetCategory } from "@/types/widget";

interface AddWidgetModalProps {
  page: string;
  col: number;
  row: number;
  onClose: () => void;
}

const categoryLabels: Record<WidgetCategory, string> = {
  overview: "Visão Geral",
  tickets: "Chamados",
  projects: "Projetos",
};

export function AddWidgetModal({ page, col, row, onClose }: AddWidgetModalProps) {
  const { layout, addWidget } = useDashboardLayout();
  const [error, setError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const availableWidgets = getWidgetsForPage(page);
  const instancedIds = new Set(layout.map((w) => w.id));

  // Filter out already-instanced widgets
  const widgets = availableWidgets.filter((w) => !instancedIds.has(w.id));

  // Group by category
  const grouped = widgets.reduce(
    (acc, w) => {
      if (!acc[w.category]) acc[w.category] = [];
      acc[w.category].push(w);
      return acc;
    },
    {} as Record<WidgetCategory, typeof widgets>
  );

  const handleAdd = (widgetId: string) => {
    setError(null);
    const def = widgetMap.get(widgetId);
    if (!def) return;

    // Check if placement is possible
    const testInstance = { id: widgetId, col, row, w: def.defaultW, h: def.defaultH };
    if (!canPlace(testInstance, layout)) {
      setError(
        `Espaço insuficiente para "${def.title}" (${def.defaultW}×${def.defaultH}) na posição ${col},${row}. Tente outra célula.`
      );
      return;
    }

    const success = addWidget(widgetId, col, row);
    if (success) {
      onClose();
    } else {
      setError("Não foi possível adicionar o widget nesta posição.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        ref={modalRef}
        className="w-full max-w-md rounded-lg border bg-card shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <h3 className="text-sm font-semibold text-card-foreground">Adicionar Widget</h3>
            <p className="text-[10px] text-muted">
              Posição: coluna {col}, linha {row}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 hover:bg-[var(--color-hover)] text-muted hover:text-card-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mx-4 mt-3 rounded bg-red-500/10 border border-red-500/30 px-3 py-2 text-[11px] text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Widget list */}
        <div className="max-h-80 overflow-y-auto p-4 space-y-4">
          {widgets.length === 0 ? (
            <p className="text-xs text-muted text-center py-4">
              Todos os widgets disponíveis já estão no dashboard.
            </p>
          ) : (
            Object.entries(grouped).map(([category, items]) => (
              <div key={category}>
                <h4 className="text-[10px] font-medium text-muted uppercase tracking-wider mb-2">
                  {categoryLabels[category as WidgetCategory]}
                </h4>
                <div className="space-y-1">
                  {items.map((widget) => (
                    <button
                      key={widget.id}
                      onClick={() => handleAdd(widget.id)}
                      className="w-full flex items-center justify-between rounded border px-3 py-2 text-left text-xs text-card-foreground hover:bg-[var(--color-hover)] hover:border-glpi-primary/40 transition-colors"
                    >
                      <span className="font-medium">{widget.title}</span>
                      <span className="text-[10px] text-muted">
                        {widget.defaultW}×{widget.defaultH}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
