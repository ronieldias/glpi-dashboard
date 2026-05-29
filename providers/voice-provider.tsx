"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

interface VoiceContextValue {
  enabled: boolean;
  toggle: () => void;
  /** Enfileira um texto. `voiceOverride` toca com uma voz específica (preview). */
  speak: (text: string, voiceOverride?: string) => void;
  /** Para imediatamente o áudio atual e limpa a fila. */
  stop: () => void;
}

const VoiceContext = createContext<VoiceContextValue | null>(null);

export function useVoice(): VoiceContextValue {
  const ctx = useContext(VoiceContext);
  if (!ctx) throw new Error("useVoice deve ser usado dentro de <VoiceProvider>");
  return ctx;
}

const STORAGE_KEY = "glpi-voice";
const SILENT_WAV =
  "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";

interface QueueItem {
  text: string;
  voice?: string;
}

export function VoiceProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  const queueRef = useRef<QueueItem[]>([]);
  const playingRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const endCurrentRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    audioRef.current = new Audio();
    return () => audioRef.current?.pause();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY) === "1") {
      setEnabled(true);
    }
  }, []);

  const playNext = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || playingRef.current) return;
    const item = queueRef.current.shift();
    if (!item) return;

    playingRef.current = true;
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: item.text, voice: item.voice || undefined }),
      });
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        console.warn(`[voz] /api/tts retornou ${res.status}:`, body.slice(0, 200));
      } else {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        audio.pause();
        audio.src = url;
        await new Promise<void>((resolve) => {
          let settled = false;
          const done = () => {
            if (settled) return;
            settled = true;
            audio.onended = null;
            audio.onerror = null;
            endCurrentRef.current = null;
            URL.revokeObjectURL(url);
            resolve();
          };
          endCurrentRef.current = done;
          audio.onended = done;
          audio.onerror = done;
          audio.play().catch((err) => {
            console.warn(
              "[voz] o navegador bloqueou o áudio — clique no botão de voz (🔊) para liberar.",
              err,
            );
            done();
          });
        });
      }
    } catch (err) {
      console.warn("[voz] falha ao reproduzir:", err);
    } finally {
      playingRef.current = false;
    }

    if (queueRef.current.length > 0) void playNext();
  }, []);

  const stop = useCallback(() => {
    queueRef.current = [];
    audioRef.current?.pause();
    endCurrentRef.current?.();
  }, []);

  const speak = useCallback(
    (text: string, voiceOverride?: string) => {
      const clean = (text ?? "").trim();
      if (!clean) return;
      queueRef.current.push({ text: clean, voice: voiceOverride });
      if (queueRef.current.length > 6) {
        queueRef.current = queueRef.current.slice(-6);
      }
      void playNext();
    },
    [playNext],
  );

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      }
      if (next) {
        const audio = audioRef.current;
        if (audio) {
          audio.src = SILENT_WAV;
          audio.play().catch(() => {});
        }
        queueRef.current.push({ text: "Voz ativada" });
        void playNext();
      } else {
        queueRef.current = [];
        audioRef.current?.pause();
        endCurrentRef.current?.();
      }
      return next;
    });
  }, [playNext]);

  return (
    <VoiceContext.Provider value={{ enabled, toggle, speak, stop }}>
      {children}
    </VoiceContext.Provider>
  );
}
