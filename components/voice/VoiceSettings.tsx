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

export function VoiceSettings({ onClose }: { onClose: () => void }) {
  const { config, setVoice, speak, stop } = useVoice();
  const [voices, setVoices] = useState<Voice[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!config.hasKey) {
      setVoices([]);
      return;
    }
    let alive = true;
    fetch("/api/tts/voices")
      .then(async (r) => {
        const d = await r.json().catch(() => ({}));
        if (!alive) return;
        if (d.error) setError(d.error);
        else setVoices(d.voices ?? []);
      })
      .catch(() => {
        if (alive) setError("Falha ao carregar as vozes");
      });
    return () => {
      alive = false;
    };
  }, [config.hasKey]);

  const pick = (voice: string) => {
    setVoice(voice);
    stop();
    speak(
      voice === "free"
        ? "Olá, esta é a voz gratuita do navegador."
        : "Olá, esta é a voz padrão do painel.",
      voice,
    );
  };

  return (
    <div className="flex max-h-[60vh] w-72 flex-col overflow-hidden rounded-lg border border-border bg-card shadow-xl">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <span className="text-xs font-semibold text-card-foreground">
          Voz padrão do painel
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

      <ul className="overflow-y-auto py-1">
        <VoiceRow
          selected={config.voice === "free"}
          label="Gratuita (navegador)"
          sub="Web Speech API · sem custo"
          onClick={() => pick("free")}
        />

        {!config.hasKey && (
          <li className="px-3 py-2 text-[10px] leading-snug text-muted-foreground">
            Adicione <code className="text-card-foreground">GOOGLE_TTS_API_KEY</code>{" "}
            no <code className="text-card-foreground">.env.local</code> para
            liberar as vozes premium do Google.
          </li>
        )}

        {config.hasKey && error && (
          <li className="px-3 py-2 text-[11px] text-red-400">{error}</li>
        )}

        {config.hasKey && !voices && !error && (
          <li className="flex items-center gap-2 px-3 py-2 text-[11px] text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" /> Carregando vozes…
          </li>
        )}

        {config.hasKey &&
          voices?.map((v) => (
            <VoiceRow
              key={v.name}
              selected={config.voice === v.name}
              label={shortName(v.name)}
              sub={`${v.type} · ${genderLabel(v.gender)}`}
              onClick={() => pick(v.name)}
            />
          ))}
      </ul>

      <div className="border-t border-border px-3 py-1.5 text-[10px] text-muted-foreground">
        A voz escolhida vira o padrão de todas as telas (inclusive a TV).
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
          <span className="block truncate text-[10px] text-muted-foreground">
            {sub}
          </span>
        </span>
        {selected && <Check className="h-3.5 w-3.5 shrink-0 text-glpi-primary" />}
      </button>
    </li>
  );
}
