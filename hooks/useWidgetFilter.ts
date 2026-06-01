"use client";

import { createContext, useContext } from "react";
import { useFilter } from "@/hooks/useFilter";

export const WidgetFilterContext = createContext<boolean>(true);

export function useWidgetFilter(): boolean {
  return useContext(WidgetFilterContext);
}

export function useScopedFilterParams(): Record<string, string> {
  const { filterParams } = useFilter();
  const applyFilter = useWidgetFilter();
  return applyFilter ? filterParams : {};
}
