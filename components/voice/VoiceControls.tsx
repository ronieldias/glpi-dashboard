"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, Megaphone, Settings } from "lucide-react";
import { useVoice } from "@/providers/voice-provider";
import { useTicketsAll } from "@/hooks/useTickets";
import { VoiceSettings } from "@/components/voice/VoiceSettings";

interface KpisLite {
  totalOpen: number;
  slaOverdue: number;
  unassigned: number;
}

/**
 * Controles de voz para o cabeçalho (canto superior direito): liga/desliga,
 * lê o resumo agora, e abre as configurações (escolha da voz). O painel de
 * configurações abre como dropdown abaixo dos botões.
 */
export function VoiceControls() {
  const { enabled, toggle, speak } = useVoice();
  const { data } = useTicketsAll();
  const kpis = data?.kpis as KpisLite | undefined;
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const readSummary = () => {
    if (!kpis) return;
    speak(
      `Resumo: ${kpis.totalOpen} chamados em aberto, ` +
        `${kpis.slaOverdue} com SLA vencido, ` +
        `${kpis.unassigned} sem técnico.`,
    );
  };

  const base =
    "inline-flex h-7 w-7 items-center justify-center rounded-md border transition-colors";
  const neutral =
    "border-white/10 bg-white/[0.03] text-zinc-300 hover:bg-white/[0.06] hover:text-white";
  const active = "border-glpi-primary/40 bg-glpi-primary/15 text-glpi-primary";

  return (
    <div ref={ref} className="relative inline-flex items-center gap-1">
      <button
        type="button"
        onClick={toggle}
        aria-label={enabled ? "Desativar voz" : "Ativar voz"}
        title={enabled ? "Voz ativada — clique para silenciar" : "Ativar anúncios por voz"}
        className={`${base} ${enabled ? active : neutral}`}
      >
        {enabled ? (
          <Volume2 className="h-3.5 w-3.5" />
        ) : (
          <VolumeX className="h-3.5 w-3.5" />
        )}
      </button>

      {enabled && (
        <button
          type="button"
          onClick={readSummary}
          aria-label="Ler resumo agora"
          title="Ler resumo dos KPIs agora"
          className={`${base} ${neutral}`}
        >
          <Megaphone className="h-3.5 w-3.5" />
        </button>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Configurações de voz"
        title="Configurações de voz"
        className={`${base} ${open ? active : neutral}`}
      >
        <Settings className="h-3.5 w-3.5" />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2">
          <VoiceSettings onClose={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
}
