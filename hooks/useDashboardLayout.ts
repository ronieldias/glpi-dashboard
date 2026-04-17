"use client";

import { useContext } from "react";
import { DashboardContext } from "@/providers/dashboard-provider";
import type { DashboardContextValue } from "@/providers/dashboard-provider";

export function useDashboardLayout(): DashboardContextValue {
  const ctx = useContext(DashboardContext);
  if (!ctx) {
    throw new Error("useDashboardLayout must be used within a DashboardProvider");
  }
  return ctx;
}
