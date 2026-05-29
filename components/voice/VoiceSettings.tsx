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
 * Configurações da voz: lista todas as vozes pt-BR e define a voz PADRÃO do
 * painel — persistida no servidor, então vale para todas as telas (inclusive
 * a TV). Clicar numa voz salva o padrão e toca um preview.
 */
export function VoiceSettings({ onClose }: { onClose: () => void }) {
  const { speak, stop } = useVoice();
  const [voices, setVoices] = useState<Voice[] | null>(null);
  const [current, setCurrent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    Promise.all([
      fetch("/api/tts/voices").then((r) => r.json().catch(() => ({}))),
      fetch("/api/tts/config").then((r) => r.json().catch(() => ({}))),
    ])
      .then(([vd, cd]) => {
        if (!alive) return;
        if (vd.error) setError(vd.error);
        else setVoices(vd.voices ?? []);
        if (cd.voice) setCurrent(cd.voice);
      })
      .catch(() => {
        if (alive) setError("Falha ao carregar as vozes");
      });
    return () => {
      alive = false;
    };
  }, []);

  const pick = async (name: string) => {
    setSaving(name);
    try {
      const r = await fetch("/api/tts/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voice: name }),
      });
      if (r.ok) {
        setCurrent(name);
        stop(); // interrompe preview anterior (sem sobreposição)
        speak("Olá, esta é a voz padrão do painel.", name);
      } else {
        const d = await r.json().catch(() => ({}));
        setError(d.error || "Erro ao salvar a voz");
      }
    } catch {
      setError("Erro ao salvar a voz");
    } finally {
      setSaving(null);
    }
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
          {voices.map((v) => {
            const selected = current === v.name;
            const isSaving = saving === v.name;
            return (
              <li key={v.name}>
                <button
                  type="button"
                  onClick={() => pick(v.name)}
                  className={`flex w-full items-center justify-between gap-2 px-3 py-1.5 text-left transition-colors hover:bg-muted/50 ${
                    selected ? "bg-glpi-primary/10" : ""
                  }`}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-[11px] font-medium text-card-foreground">
                      {shortName(v.name)}
                    </span>
                    <span className="block truncate text-[10px] text-muted-foreground">
                      {v.type} · {genderLabel(v.gender)}
                    </span>
                  </span>
                  {isSaving ? (
                    <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-muted-foreground" />
                  ) : (
                    selected && (
                      <Check className="h-3.5 w-3.5 shrink-0 text-glpi-primary" />
                    )
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <div className="border-t border-border px-3 py-1.5 text-[10px] text-muted-foreground">
        A voz escolhida vira o padrão de todas as telas (inclusive a TV).
      </div>
    </div>
  );
}
