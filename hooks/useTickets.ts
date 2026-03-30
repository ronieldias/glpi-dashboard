"use client";

import { useQuery } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { POLLING_INTERVAL } from "@/lib/utils";

async function fetchTickets(view: string, params?: Record<string, string>) {
  const searchParams = new URLSearchParams({ view, ...params });
  const res = await fetch(`/api/glpi/tickets?${searchParams}`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: "Erro desconhecido" }));
    throw new Error(data.error || `Erro ${res.status}`);
  }
  return res.json();
}

export function useTicketsAll() {
  return useQuery({
    queryKey: ["tickets", "all"],
    queryFn: () => fetchTickets("all"),
    refetchInterval: POLLING_INTERVAL,
    meta: {
      onError: (error: Error) => {
        toast({
          variant: "destructive",
          title: "Erro ao carregar chamados",
          description: error.message,
        });
      },
    },
  });
}

export function useTicketKPIs() {
  return useQuery({
    queryKey: ["tickets", "kpis"],
    queryFn: () => fetchTickets("kpis"),
    refetchInterval: POLLING_INTERVAL,
  });
}

export function useTicketsByStatus() {
  return useQuery({
    queryKey: ["tickets", "by-status"],
    queryFn: () => fetchTickets("by-status"),
    refetchInterval: POLLING_INTERVAL,
  });
}

export function useTicketTrend(days: number) {
  return useQuery({
    queryKey: ["tickets", "trend", days],
    queryFn: () => fetchTickets("trend", { days: String(days) }),
    refetchInterval: POLLING_INTERVAL,
  });
}

export function useRecentTickets() {
  return useQuery({
    queryKey: ["tickets", "recent"],
    queryFn: () => fetchTickets("recent"),
    refetchInterval: POLLING_INTERVAL,
  });
}
