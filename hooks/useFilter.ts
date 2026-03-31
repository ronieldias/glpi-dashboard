"use client";

import { createContext, useContext } from "react";

export type FilterPreset = "day" | "week" | "month" | "year" | "custom" | null;

export interface FilterState {
  preset: FilterPreset;
  dateFrom: string | null;
  dateTo: string | null;
}

export interface FilterContextType {
  filter: FilterState;
  setPreset: (preset: Exclude<FilterPreset, "custom" | null>) => void;
  setCustomRange: (from: string, to: string) => void;
  clearFilter: () => void;
  /** Retorna os query params para passar para a API */
  filterParams: Record<string, string>;
  /** Label do filtro ativo para exibição */
  filterLabel: string | null;
}

export const FilterContext = createContext<FilterContextType>({
  filter: { preset: null, dateFrom: null, dateTo: null },
  setPreset: () => {},
  setCustomRange: () => {},
  clearFilter: () => {},
  filterParams: {},
  filterLabel: null,
});

export function useFilter() {
  return useContext(FilterContext);
}
