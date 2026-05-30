"use client";

import { useEffect, useRef } from "react";
import { useVoice } from "@/providers/voice-provider";
import { useTicketsAll } from "@/hooks/useTickets";

/** Intervalo do resumo falado dos KPIs. */
const KPI_SUMMARY_MS = 10 * 60 * 1000; // 10 min

interface RecentLite {
  id: number;
  name: string;
  typeLabel: string;
  priorityLabel: string;
  recipientName: string;
  date_creation: string;
  sla: string;
  slaOverdue: boolean;
}

interface KpisLite {
  totalOpen: number;
  slaOverdue: number;
  unassigned: number;
}

/**
 * Dispara os anúncios por voz a partir dos dados de chamados.
 *
 * Pontos-chave para NÃO anunciar aleatoriamente:
 * - os IDs já anunciados ACUMULAM (Set que só cresce), então cada chamado é
 *   falado UMA única vez — mesmo que ele saia e volte ao top‑25 (a lista
 *   "recentes" é limitada, então a membership oscila);
 * - ao LIGAR a voz, "arma" registrando os atuais como já vistos (não anuncia o
 *   backlog) e, daí em diante, fala só os que chegarem.
 */
export function VoiceAnnouncer() {
  const { enabled, speak } = useVoice();
  const { data } = useTicketsAll();

  const recent = (data?.recent ?? []) as RecentLite[];
  const kpis = data?.kpis as KpisLite | undefined;

  const armed = useRef(false);
  const announced = useRef<Set<number>>(new Set());
  const announcedOverdue = useRef<Set<number>>(new Set());

  // Desligar a voz "desarma": ao religar, a baseline é refeita (sem backlog).
  useEffect(() => {
    if (!enabled) armed.current = false;
  }, [enabled]);

  useEffect(() => {
    if (!enabled || recent.length === 0) return;

    // Primeira leitura após ligar: registra o estado atual como baseline.
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

    // Novos chamados (nunca anunciados) — na ordem de chegada.
    const novos = recent
      .filter((t) => !announced.current.has(t.id))
      .sort(byArrival);
    for (const t of novos) {
      announced.current.add(t.id);
      speak(
        `Novo chamado ${t.typeLabel}, prioridade ${t.priorityLabel}: ` +
          `${t.name}. Solicitante ${t.recipientName}.`,
      );
    }

    // SLA recém-vencidos (nunca anunciados como vencidos).
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

  // Resumo periódico dos KPIs
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
