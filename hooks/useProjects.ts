"use client";

import { useQuery } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { POLLING_INTERVAL } from "@/lib/utils";
import { useFilter } from "@/hooks/useFilter";

async function fetchProjects(view: string, params?: Record<string, string>) {
  const searchParams = new URLSearchParams({ view, ...params });
  const res = await fetch(`/api/glpi/projects?${searchParams}`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: "Erro desconhecido" }));
    throw new Error(data.error || `Erro ${res.status}`);
  }
  return res.json();
}

export function useProjectsAll() {
  const { filterParams } = useFilter();

  return useQuery({
    queryKey: ["projects", "all", filterParams],
    queryFn: () => fetchProjects("all", filterParams),
    refetchInterval: POLLING_INTERVAL,
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
  const { filterParams } = useFilter();

  return useQuery({
    queryKey: ["projects", "kpis", filterParams],
    queryFn: () => fetchProjects("kpis", filterParams),
    refetchInterval: POLLING_INTERVAL,
  });
}

export function useProjectsByStatus() {
  const { filterParams } = useFilter();

  return useQuery({
    queryKey: ["projects", "by-status", filterParams],
    queryFn: () => fetchProjects("by-status", filterParams),
    refetchInterval: POLLING_INTERVAL,
  });
}

export function useProjectProgress() {
  const { filterParams } = useFilter();

  return useQuery({
    queryKey: ["projects", "progress", filterParams],
    queryFn: () => fetchProjects("progress", filterParams),
    refetchInterval: POLLING_INTERVAL,
  });
}

export function useProjectList() {
  const { filterParams } = useFilter();

  return useQuery({
    queryKey: ["projects", "list", filterParams],
    queryFn: () => fetchProjects("list", filterParams),
    refetchInterval: POLLING_INTERVAL,
  });
}
