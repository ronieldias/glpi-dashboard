"use client";

import { useEffect, useState } from "react";
import { Check, X, Loader2 } from "lucide-react";
import { useVoice } from "@/providers/voice-provider";

interface Voice {
  name: string;
  gender: string;
  type: string;
}

function shortName(name: string): string {
  return name.replace(/^pt-BR-/, "");
}

function genderLabel(gender: string): string {
  if (gender === "FEMALE") return "Feminina";
  if (gender === "MALE") return "Masculina";
  return "Neutra";
}

/**
 * Painel de configurações da voz: lista TODAS as vozes pt-BR disponíveis no
 * Google TTS (ordenadas por qualidade), com preview ao clicar.
 */
export function VoiceSettings({ onClose }: { onClose: () => void }) {
  const { voiceName, setVoiceName, speak, stop } = useVoice();
  const [voices, setVoices] = useState<Voice[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/tts/voices")
      .then(async (r) => {
        const d = await r.json().catch(() => ({}));
        if (!alive) return;
        if (!r.ok) setError(d.error || `Erro ${r.status}`);
        else setVoices(d.voices ?? []);
      })
      .catch(() => {
        if (alive) setError("Falha ao listar vozes");
      });
    return () => {
      alive = false;
    };
  }, []);

  const pick = (name: string) => {
    setVoiceName(name);
    stop(); // interrompe qualquer áudio/preview anterior (não empilha vozes)
    speak("Olá, esta é a voz selecionada para os anúncios.", name);
  };

  return (
    <div className="flex max-h-[60vh] w-72 flex-col overflow-hidden rounded-lg border border-border bg-card shadow-xl">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <span className="text-xs font-semibold text-card-foreground">
          Voz dos anúncios
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="text-muted-foreground transition-colors hover:text-card-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {error && (
        <p className="px-3 py-3 text-[11px] text-red-400">
          {error}
          <span className="mt-1 block text-muted-foreground">
            Verifique a chave do Google TTS no .env.local.
          </span>
        </p>
      )}

      {!voices && !error && (
        <p className="flex items-center gap-2 px-3 py-3 text-[11px] text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" /> Carregando vozes…
        </p>
      )}

      {voices && (
        <ul className="overflow-y-auto py-1">
          <VoiceRow
            selected={voiceName === ""}
            label="Padrão do servidor"
            sub="usa GOOGLE_TTS_VOICE"
            onClick={() => pick("")}
          />
          {voices.map((v) => (
            <VoiceRow
              key={v.name}
              selected={voiceName === v.name}
              label={shortName(v.name)}
              sub={`${v.type} · ${genderLabel(v.gender)}`}
              onClick={() => pick(v.name)}
            />
          ))}
        </ul>
      )}

      <div className="border-t border-border px-3 py-1.5 text-[10px] text-muted-foreground">
        Clique numa voz para ouvir e selecionar.
      </div>
    </div>
  );
}

function VoiceRow({
  selected,
  label,
  sub,
  onClick,
}: {
  selected: boolean;
  label: string;
  sub: string;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className={`flex w-full items-center justify-between gap-2 px-3 py-1.5 text-left transition-colors hover:bg-muted/50 ${
          selected ? "bg-glpi-primary/10" : ""
        }`}
      >
        <span className="min-w-0">
          <span className="block truncate text-[11px] font-medium text-card-foreground">
            {label}
          </span>
          {sub && (
            <span className="block truncate text-[10px] text-muted-foreground">
              {sub}
            </span>
          )}
        </span>
        {selected && (
          <Check className="h-3.5 w-3.5 shrink-0 text-glpi-primary" />
        )}
      </button>
    </li>
  );
}
