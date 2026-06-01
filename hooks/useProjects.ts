"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { POLLING_INTERVAL } from "@/lib/utils";
import { useScopedFilterParams } from "@/hooks/useWidgetFilter";

async function fetchProjectsAll(params: Record<string, string>) {
  const searchParams = new URLSearchParams({ view: "all", ...params });
  const res = await fetch(`/api/glpi/projects?${searchParams}`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: "Erro desconhecido" }));
    throw new Error(data.error || `Erro ${res.status}`);
  }
  return res.json();
}

export function useProjectsAll() {
  const filterParams = useScopedFilterParams();

  return useQuery({
    queryKey: ["projects", "all", filterParams],
    queryFn: () => fetchProjectsAll(filterParams),
    refetchInterval: POLLING_INTERVAL,
    placeholderData: keepPreviousData,
    meta: {
      onError: (error: Error) => {
        toast({
          variant: "destructive",
          title: "Erro ao carregar projetos",
          description: error.message,
        });
      },
    },
  });
}

export function useProjectKPIs() {
  const filterParams = useScopedFilterParams();
  return useQuery({
    queryKey: ["projects", "all", filterParams],
    queryFn: () => fetchProjectsAll(filterParams),
    refetchInterval: POLLING_INTERVAL,
    placeholderData: keepPreviousData,
    select: (data: { kpis: unknown }) => data.kpis,
  });
}

export function useProjectsByStatus() {
  const filterParams = useScopedFilterParams();
  return useQuery({
    queryKey: ["projects", "all", filterParams],
    queryFn: () => fetchProjectsAll(filterParams),
    refetchInterval: POLLING_INTERVAL,
    placeholderData: keepPreviousData,
    select: (data: { byStatus: unknown }) => data.byStatus,
  });
}

export function useProjectProgress() {
  const filterParams = useScopedFilterParams();
  return useQuery({
    queryKey: ["projects", "all", filterParams],
    queryFn: () => fetchProjectsAll(filterParams),
    refetchInterval: POLLING_INTERVAL,
    placeholderData: keepPreviousData,
    select: (data: { progress: unknown }) => data.progress,
  });
}

export function useProjectList() {
  const filterParams = useScopedFilterParams();
  return useQuery({
    queryKey: ["projects", "all", filterParams],
    queryFn: () => fetchProjectsAll(filterParams),
    refetchInterval: POLLING_INTERVAL,
    placeholderData: keepPreviousData,
    select: (data: { list: unknown }) => data.list,
  });
}
