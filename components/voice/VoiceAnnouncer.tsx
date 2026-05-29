"use client";

import { useEffect, useRef } from "react";
import { useVoice } from "@/providers/voice-provider";
import { useTicketsAll } from "@/hooks/useTickets";

/** Intervalo do resumo falado dos KPIs. */
const KPI_SUMMARY_MS = 10 * 60 * 1000; // 10 min

interface RecentLite {
  id: number;
  name: string;
  priorityLabel: string;
  sla: string;
  slaOverdue: boolean;
}

interface KpisLite {
  totalOpen: number;
  slaOverdue: number;
  unassigned: number;
}

/**
 * Dispara os anúncios por voz a partir dos dados de chamados (sem UI própria).
 * - Novos chamados (entraram desde a última leitura)
 * - Novos SLA vencidos
 * - Resumo periódico dos KPIs
 *
 * Só fala quando a voz está ativada. Na primeira carga apenas registra a
 * baseline (não anuncia os chamados já existentes).
 */
export function VoiceAnnouncer() {
  const { enabled, speak } = useVoice();
  const { data } = useTicketsAll();

  const recent = (data?.recent ?? []) as RecentLite[];
  const kpis = data?.kpis as KpisLite | undefined;

  const seenIds = useRef<Set<number> | null>(null);
  const overdueIds = useRef<Set<number>>(new Set());

  // Novos chamados + novos SLA vencidos
  useEffect(() => {
    if (recent.length === 0) return;

    const currentIds = new Set(recent.map((t) => t.id));
    const currentOverdue = new Set(
      recent.filter((t) => t.slaOverdue && t.sla !== "-").map((t) => t.id),
    );

    // só anuncia a partir da 2ª leitura (evita falar tudo no 1º carregamento)
    if (seenIds.current && enabled) {
      const novos = recent.filter((t) => !seenIds.current!.has(t.id));
      for (const t of novos.slice(0, 2)) {
        speak(`Novo chamado, prioridade ${t.priorityLabel}: ${t.name}`);
      }

      const novosVencidos = recent.filter(
        (t) => currentOverdue.has(t.id) && !overdueIds.current.has(t.id),
      );
      for (const t of novosVencidos.slice(0, 2)) {
        speak(`Atenção: SLA vencido no chamado ${t.name}`);
      }
    }

    seenIds.current = currentIds;
    overdueIds.current = currentOverdue;
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
