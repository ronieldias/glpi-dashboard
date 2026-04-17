"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ChartDataItem } from "@/types/glpi";

interface ProjectProgressProps {
  data?: ChartDataItem[];
  loading?: boolean;
}

const ROTATION_INTERVAL_MS = 10_000;
const MIN_ITEM_HEIGHT = 40;
const MIN_ITEMS_PER_PAGE = 3;
const MAX_ITEMS_PER_PAGE = 20;
const CHART_VERTICAL_PADDING = 20;

function calcItemsPerPage(heightPx: number): number {
  const usable = Math.max(0, heightPx - CHART_VERTICAL_PADDING);
  const raw = Math.floor(usable / MIN_ITEM_HEIGHT);
  return Math.min(MAX_ITEMS_PER_PAGE, Math.max(MIN_ITEMS_PER_PAGE, raw));
}

export function ProjectProgress({ data, loading }: ProjectProgressProps) {
  const [containerEl, setContainerEl] = useState<HTMLDivElement | null>(null);
  const [itemsPerPage, setItemsPerPage] = useState(MIN_ITEMS_PER_PAGE);

  useEffect(() => {
    if (!containerEl) return;

    const update = () =>
      setItemsPerPage(calcItemsPerPage(containerEl.clientHeight));
    update();

    const observer = new ResizeObserver(update);
    observer.observe(containerEl);
    return () => observer.disconnect();
  }, [containerEl]);

  const pages = useMemo<ChartDataItem[][]>(() => {
    if (!data || data.length === 0) return [];
    const chunks: ChartDataItem[][] = [];
    for (let i = 0; i < data.length; i += itemsPerPage) {
      chunks.push(data.slice(i, i + itemsPerPage));
    }
    return chunks;
  }, [data, itemsPerPage]);

  const [pageIndex, setPageIndex] = useState(0);

  useEffect(() => {
    if (pageIndex >= pages.length) setPageIndex(0);
  }, [pages.length, pageIndex]);

  useEffect(() => {
    if (pages.length <= 1) return;
    const id = setInterval(() => {
      setPageIndex((prev) => (prev + 1) % pages.length);
    }, ROTATION_INTERVAL_MS);
    return () => clearInterval(id);
  }, [pages.length]);

  const isLoading = loading || !data;
  const currentPage = pages[pageIndex] ?? [];
  const displayed = currentPage.map((d) => ({
    ...d,
    name: d.name.length > 28 ? d.name.slice(0, 26) + "..." : d.name,
    fullName: d.name,
  }));
  const showPager = pages.length > 1;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-0.5 pt-1.5 px-3 flex-shrink-0">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-xs">Progresso por Projeto</CardTitle>
          {showPager && !isLoading && (
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] text-muted-foreground tabular-nums">
                {pageIndex + 1}/{pages.length}
              </span>
              <div className="flex items-center gap-1">
                {pages.map((_, i) => (
                  <span
                    key={i}
                    className={`block h-1 rounded-full transition-all duration-500 ${
                      i === pageIndex ? "w-3 bg-[#AEC43B]" : "w-1 bg-muted"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent ref={setContainerEl} className="flex-1 min-h-0 px-1 pb-2">
        {isLoading ? (
          <Skeleton className="h-full w-full" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={displayed}
              layout="vertical"
              margin={{ left: 0, right: 10, top: 5, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
                stroke="var(--color-chart-grid)"
              />
              <XAxis
                type="number"
                domain={[0, 100]}
                unit="%"
                fontSize={9}
                tick={{ fill: "var(--color-chart-text)" }}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={140}
                fontSize={10}
                tick={{ fill: "var(--color-chart-text)" }}
                interval={0}
              />
              <Tooltip
                formatter={(value: number) => `${value}%`}
                labelFormatter={(label) => {
                  const item = displayed.find((d) => d.name === label);
                  return item?.fullName || label;
                }}
                contentStyle={{
                  backgroundColor: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-card-fg)",
                }}
              />
              <Bar
                dataKey="value"
                name="Progresso"
                fill="#AEC43B"
                radius={[0, 3, 3, 0]}
                isAnimationActive
                animationDuration={600}
              >
                {displayed.map((entry, i) => (
                  <Cell key={i} fill={entry.color || "#AEC43B"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
