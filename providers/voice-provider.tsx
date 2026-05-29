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
  /** Anúncios por voz ativados pelo usuário (gesto necessário p/ autoplay). */
  enabled: boolean;
  toggle: () => void;
  /** Enfileira um texto para ser falado (best-effort; não bloqueia). */
  speak: (text: string) => void;
}

const VoiceContext = createContext<VoiceContextValue | null>(null);

export function useVoice(): VoiceContextValue {
  const ctx = useContext(VoiceContext);
  if (!ctx) throw new Error("useVoice deve ser usado dentro de <VoiceProvider>");
  return ctx;
}

const STORAGE_KEY = "glpi-voice";

export function VoiceProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  const queueRef = useRef<string[]>([]);
  const playingRef = useRef(false);

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY) === "1") {
      setEnabled(true);
    }
  }, []);

  // Toca a fila em série (um áudio por vez), para os anúncios não se sobreporem.
  const playNext = useCallback(async () => {
    if (playingRef.current) return;
    const text = queueRef.current.shift();
    if (!text) return;

    playingRef.current = true;
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        await audio.play().catch(() => {});
        await new Promise<void>((resolve) => {
          audio.onended = () => resolve();
          audio.onerror = () => resolve();
        });
        URL.revokeObjectURL(url);
      }
    } catch {
      // voz é best-effort: falha de rede/áudio não deve quebrar o painel
    } finally {
      playingRef.current = false;
    }

    if (queueRef.current.length > 0) void playNext();
  }, []);

  const speak = useCallback(
    (text: string) => {
      const clean = (text ?? "").trim();
      if (!clean) return;
      queueRef.current.push(clean);
      // não deixa a fila crescer indefinidamente (alertas atrasados perdem valor)
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
        // o clique do usuário libera o autoplay; confirma por voz
        queueRef.current.push("Voz ativada");
        void playNext();
      } else {
        queueRef.current = [];
      }
      return next;
    });
  }, [playNext]);

  return (
    <VoiceContext.Provider value={{ enabled, toggle, speak }}>
      {children}
    </VoiceContext.Provider>
  );
}
