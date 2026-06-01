"use client";

import { useEffect, useRef } from "react";
import { useVoice } from "@/providers/voice-provider";
import { useTicketsAll } from "@/hooks/useTickets";

const KPI_SUMMARY_MS = 10 * 60 * 1000;

interface RecentLite {
  id: number;
  name: string;
  typeLabel: string;
  priorityLabel: string;
  recipientName: string;
  location: string;
  date_creation: string;
  sla: string;
  slaOverdue: boolean;
}

interface KpisLite {
  totalOpen: number;
  slaOverdue: number;
  unassigned: number;
}

export function VoiceAnnouncer() {
  const { enabled, speak } = useVoice();
  const { data } = useTicketsAll();

  const recent = (data?.recent ?? []) as RecentLite[];
  const kpis = data?.kpis as KpisLite | undefined;

  const armed = useRef(false);
  const announced = useRef<Set<number>>(new Set());
  const announcedOverdue = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (!enabled) armed.current = false;
  }, [enabled]);

  useEffect(() => {
    if (!enabled || recent.length === 0) return;

    if (!armed.current) {
      armed.current = true;
      announced.current = new Set(recent.map((t) => t.id));
      announcedOverdue.current = new Set(
        recent.filter((t) => t.slaOverdue && t.sla !== "-").map((t) => t.id),
      );
      return;
    }

    const byArrival = (a: RecentLite, b: RecentLite) =>
      new Date(a.date_creation).getTime() - new Date(b.date_creation).getTime();

    const novos = recent
      .filter((t) => !announced.current.has(t.id))
      .sort(byArrival);
    for (const t of novos) {
      announced.current.add(t.id);
      const setor = t.location && t.location !== "-" ? `, setor ${t.location}` : "";
      speak(
        `Novo chamado ${t.typeLabel}, prioridade ${t.priorityLabel}: ` +
          `${t.name}. Solicitante ${t.recipientName}${setor}.`,
      );
    }

    const novosVencidos = recent.filter(
      (t) =>
        t.slaOverdue &&
        t.sla !== "-" &&
        !announcedOverdue.current.has(t.id),
    );
    for (const t of novosVencidos) {
      announcedOverdue.current.add(t.id);
      speak(`Atenção: SLA vencido no chamado ${t.name}`);
    }
  }, [recent, enabled, speak]);

  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => {
      if (!kpis) return;
      speak(
        `Resumo: ${kpis.totalOpen} chamados em aberto, ` +
          `${kpis.slaOverdue} com SLA vencido, ` +
          `${kpis.unassigned} sem técnico.`,
      );
    }, KPI_SUMMARY_MS);
    return () => clearInterval(id);
  }, [enabled, kpis, speak]);

  return null;
}
