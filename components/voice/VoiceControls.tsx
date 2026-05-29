"use client";

import { Volume2, VolumeX, Megaphone } from "lucide-react";
import { useVoice } from "@/providers/voice-provider";
import { useTicketsAll } from "@/hooks/useTickets";

interface KpisLite {
  totalOpen: number;
  slaOverdue: number;
  unassigned: number;
}

/**
 * Controle flutuante de voz (canto inferior esquerdo, em todas as páginas):
 * - botão liga/desliga os anúncios (o clique também libera o autoplay)
 * - quando ativo, um botão para "ler o resumo agora" (gatilho manual)
 */
export function VoiceControls() {
  const { enabled, toggle, speak } = useVoice();
  const { data } = useTicketsAll();
  const kpis = data?.kpis as KpisLite | undefined;

  const readSummary = () => {
    if (!kpis) return;
    speak(
      `Resumo: ${kpis.totalOpen} chamados em aberto, ` +
        `${kpis.slaOverdue} com SLA vencido, ` +
        `${kpis.unassigned} sem técnico.`,
    );
  };

  return (
    <div className="fixed bottom-4 left-20 z-50 flex items-center gap-2">
      <button
        type="button"
        onClick={toggle}
        aria-label={enabled ? "Desativar voz" : "Ativar voz"}
        title={
          enabled
            ? "Voz ativada — clique para silenciar"
            : "Ativar anúncios por voz"
        }
        className={`flex h-9 w-9 items-center justify-center rounded-full border shadow-lg transition-colors ${
          enabled
            ? "border-glpi-primary/40 bg-glpi-primary/15 text-glpi-primary"
            : "border-border bg-card text-muted-foreground hover:text-card-foreground"
        }`}
      >
        {enabled ? (
          <Volume2 className="h-4 w-4" />
        ) : (
          <VolumeX className="h-4 w-4" />
        )}
      </button>

      {enabled && (
        <button
          type="button"
          onClick={readSummary}
          aria-label="Ler resumo agora"
          title="Ler resumo dos KPIs agora"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-lg transition-colors hover:text-card-foreground"
        >
          <Megaphone className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
