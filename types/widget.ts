import type { ComponentType } from "react";

export type WidgetCategory = "overview" | "tickets" | "projects";

export interface WidgetDefinition {
  id: string;
  title: string;
  category: WidgetCategory;
  defaultW: number;
  defaultH: number;
  minW: number;
  minH: number;
  maxW: number;
  maxH: number;
  component: ComponentType<Record<string, unknown>>;
}

export interface WidgetInstance {
  id: string;
  col: number;
  row: number;
  w: number;
  h: number;
}

export type PageLayout = WidgetInstance[];

export const PAGE_ALLOWED_CATEGORIES: Record<string, WidgetCategory[]> = {
  "/dashboard": ["overview", "tickets", "projects"],
  "/dashboard/tickets": ["overview", "tickets"],
  "/dashboard/projects": ["overview", "projects"],
};

export const GRID_COLS = 12;
export const GRID_ROWS = 8;
