"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { POLLING_INTERVAL } from "@/lib/utils";
import { useFilter } from "@/hooks/useFilter";

/**
 * Source of truth para dados de tickets: 1 fetch por polling.
 * Todos os hooks abaixo (KPIs, byStatus, byTrend, recent) consomem o MESMO
 * queryKey via `select` — TanStack Query desduplica a request e cada widget
 * recebe sua fatia sem refetch concorrente.
 *
 * `placeholderData: keepPreviousData` evita o "flash de loading" enquanto a
 * próxima rodada de polling chega — a tela mantém o estado anterior até o
 * fetch novo terminar.
 */
async function fetchTicketsAll(params: Record<string, string>) {
  const searchParams = new URLSearchParams({ view: "all", ...params });
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
    queryFn: () => fetchTicketsAll(filterParams),
    refetchInterval: POLLING_INTERVAL,
    placeholderData: keepPreviousData,
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

// Hooks de conveniência: views específicas usando `select` no mesmo queryKey.
// Não disparam fetch extra — reusam o cache de useTicketsAll.

export function useTicketKPIs() {
  const { filterParams } = useFilter();
  return useQuery({
    queryKey: ["tickets", "all", filterParams],
    queryFn: () => fetchTicketsAll(filterParams),
    refetchInterval: POLLING_INTERVAL,
    placeholderData: keepPreviousData,
    select: (data: { kpis: unknown }) => data.kpis,
  });
}

export function useTicketsByStatus() {
  const { filterParams } = useFilter();
  return useQuery({
    queryKey: ["tickets", "all", filterParams],
    queryFn: () => fetchTicketsAll(filterParams),
    refetchInterval: POLLING_INTERVAL,
    placeholderData: keepPreviousData,
    select: (data: { byStatus: unknown }) => data.byStatus,
  });
}

export function useTicketTrend() {
  const { filterParams } = useFilter();
  return useQuery({
    queryKey: ["tickets", "all", filterParams],
    queryFn: () => fetchTicketsAll(filterParams),
    refetchInterval: POLLING_INTERVAL,
    placeholderData: keepPreviousData,
    select: (data: { trend: unknown }) => data.trend,
  });
}

export function useRecentTickets() {
  const { filterParams } = useFilter();
  return useQuery({
    queryKey: ["tickets", "all", filterParams],
    queryFn: () => fetchTicketsAll(filterParams),
    refetchInterval: POLLING_INTERVAL,
    placeholderData: keepPreviousData,
    select: (data: { recent: unknown }) => data.recent,
  });
}
