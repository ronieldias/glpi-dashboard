"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { POLLING_INTERVAL } from "@/lib/utils";
import { useScopedFilterParams } from "@/hooks/useWidgetFilter";

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
  const filterParams = useScopedFilterParams();

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

export function useTicketKPIs() {
  const filterParams = useScopedFilterParams();
  return useQuery({
    queryKey: ["tickets", "all", filterParams],
    queryFn: () => fetchTicketsAll(filterParams),
    refetchInterval: POLLING_INTERVAL,
    placeholderData: keepPreviousData,
    select: (data: { kpis: unknown }) => data.kpis,
  });
}

export function useTicketsByStatus() {
  const filterParams = useScopedFilterParams();
  return useQuery({
    queryKey: ["tickets", "all", filterParams],
    queryFn: () => fetchTicketsAll(filterParams),
    refetchInterval: POLLING_INTERVAL,
    placeholderData: keepPreviousData,
    select: (data: { byStatus: unknown }) => data.byStatus,
  });
}

export function useTicketTrend() {
  const filterParams = useScopedFilterParams();
  return useQuery({
    queryKey: ["tickets", "all", filterParams],
    queryFn: () => fetchTicketsAll(filterParams),
    refetchInterval: POLLING_INTERVAL,
    placeholderData: keepPreviousData,
    select: (data: { trend: unknown }) => data.trend,
  });
}

export function useRecentTickets() {
  const filterParams = useScopedFilterParams();
  return useQuery({
    queryKey: ["tickets", "all", filterParams],
    queryFn: () => fetchTicketsAll(filterParams),
    refetchInterval: POLLING_INTERVAL,
    placeholderData: keepPreviousData,
    select: (data: { recent: unknown }) => data.recent,
  });
}
