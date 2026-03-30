"use client";

import { useQuery } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { POLLING_INTERVAL } from "@/lib/utils";

async function fetchProjects(view: string) {
  const res = await fetch(`/api/glpi/projects?view=${view}`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: "Erro desconhecido" }));
    throw new Error(data.error || `Erro ${res.status}`);
  }
  return res.json();
}

export function useProjectsAll() {
  return useQuery({
    queryKey: ["projects", "all"],
    queryFn: () => fetchProjects("all"),
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
  return useQuery({
    queryKey: ["projects", "kpis"],
    queryFn: () => fetchProjects("kpis"),
    refetchInterval: POLLING_INTERVAL,
  });
}

export function useProjectsByStatus() {
  return useQuery({
    queryKey: ["projects", "by-status"],
    queryFn: () => fetchProjects("by-status"),
    refetchInterval: POLLING_INTERVAL,
  });
}

export function useProjectProgress() {
  return useQuery({
    queryKey: ["projects", "progress"],
    queryFn: () => fetchProjects("progress"),
    refetchInterval: POLLING_INTERVAL,
  });
}

export function useProjectList() {
  return useQuery({
    queryKey: ["projects", "list"],
    queryFn: () => fetchProjects("list"),
    refetchInterval: POLLING_INTERVAL,
  });
}
