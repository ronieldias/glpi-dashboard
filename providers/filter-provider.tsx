"use client";

import { useState, useMemo, type ReactNode } from "react";
import { FilterContext, type FilterState, type FilterPreset } from "@/hooks/useFilter";

function toLocalDateStr(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function computeDates(preset: Exclude<FilterPreset, "custom" | null>): { from: string; to: string } {
  const now = new Date();
  const to = toLocalDateStr(now);

  switch (preset) {
    case "day": {
      return { from: to, to };
    }
    case "week": {
      const d = new Date(now);
      // Domingo = inicio da semana
      d.setDate(d.getDate() - d.getDay());
      return { from: toLocalDateStr(d), to };
    }
    case "month": {
      const d = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from: toLocalDateStr(d), to };
    }
    case "year": {
      const d = new Date(now.getFullYear(), 0, 1);
      return { from: toLocalDateStr(d), to };
    }
  }
}

const presetLabels: Record<string, string> = {
  day: "Hoje",
  week: "Esta semana",
  month: "Este mês",
  year: "Este ano",
};

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filter, setFilter] = useState<FilterState>({
    preset: null,
    dateFrom: null,
    dateTo: null,
  });

  const setPreset = (preset: Exclude<FilterPreset, "custom" | null>) => {
    const { from, to } = computeDates(preset);
    setFilter({ preset, dateFrom: from, dateTo: to });
  };

  const setCustomRange = (from: string, to: string) => {
    setFilter({ preset: "custom", dateFrom: from, dateTo: to });
  };

  const clearFilter = () => {
    setFilter({ preset: null, dateFrom: null, dateTo: null });
  };

  const filterParams = useMemo(() => {
    const params: Record<string, string> = {};
    if (filter.dateFrom) params.dateFrom = filter.dateFrom;
    if (filter.dateTo) params.dateTo = filter.dateTo;
    return params;
  }, [filter.dateFrom, filter.dateTo]);

  const filterLabel = useMemo(() => {
    if (!filter.preset) return null;
    if (filter.preset === "custom" && filter.dateFrom && filter.dateTo) {
      const fmt = (d: string) =>
        new Date(d + "T00:00:00").toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "2-digit",
        });
      return `${fmt(filter.dateFrom)} - ${fmt(filter.dateTo)}`;
    }
    return presetLabels[filter.preset] || null;
  }, [filter]);

  return (
    <FilterContext.Provider
      value={{ filter, setPreset, setCustomRange, clearFilter, filterParams, filterLabel }}
    >
      {children}
    </FilterContext.Provider>
  );
}
