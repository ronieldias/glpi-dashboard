"use client";

import { useQuery } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { POLLING_INTERVAL } from "@/lib/utils";
import { useFilter } from "@/hooks/useFilter";

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
  const { filterParams } = useFilter();

  return useQuery({
    queryKey: ["tickets", "all", filterParams],
    queryFn: () => fetchTickets("all", filterParams),
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
  const { filterParams } = useFilter();

  return useQuery({
    queryKey: ["tickets", "kpis", filterParams],
    queryFn: () => fetchTickets("kpis", filterParams),
    refetchInterval: POLLING_INTERVAL,
  });
}

export function useTicketsByStatus() {
  const { filterParams } = useFilter();

  return useQuery({
    queryKey: ["tickets", "by-status", filterParams],
    queryFn: () => fetchTickets("by-status", filterParams),
    refetchInterval: POLLING_INTERVAL,
  });
}

export function useTicketTrend(days: number) {
  const { filterParams } = useFilter();

  return useQuery({
    queryKey: ["tickets", "trend", days, filterParams],
    queryFn: () => fetchTickets("trend", { days: String(days), ...filterParams }),
    refetchInterval: POLLING_INTERVAL,
  });
}

export function useRecentTickets() {
  const { filterParams } = useFilter();

  return useQuery({
    queryKey: ["tickets", "recent", filterParams],
    queryFn: () => fetchTickets("recent", filterParams),
    refetchInterval: POLLING_INTERVAL,
  });
}
