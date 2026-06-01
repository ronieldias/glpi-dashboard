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

interface VoiceConfig {
  voice: string;
  hasKey: boolean;
}

interface VoiceContextValue {
  enabled: boolean;
  toggle: () => void;
  speak: (text: string, voiceOverride?: string) => void;
  stop: () => void;
  config: VoiceConfig;
  setVoice: (voice: string) => void;
}

const VoiceContext = createContext<VoiceContextValue | null>(null);

export function useVoice(): VoiceContextValue {
  const ctx = useContext(VoiceContext);
  if (!ctx) throw new Error("useVoice deve ser usado dentro de <VoiceProvider>");
  return ctx;
}

const STORAGE_KEY = "glpi-voice";
const FREE_VOICE = "free";
const SILENT_WAV =
  "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";

interface QueueItem {
  text: string;
  voice?: string;
}

export function VoiceProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  const [config, setConfigState] = useState<VoiceConfig>({
    voice: FREE_VOICE,
    hasKey: false,
  });
  const configRef = useRef(config);
  const queueRef = useRef<QueueItem[]>([]);
  const playingRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const endCurrentRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    configRef.current = config;
  }, [config]);

  useEffect(() => {
    audioRef.current = new Audio();
    return () => audioRef.current?.pause();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY) === "1") {
      setEnabled(true);
    }
    fetch("/api/tts/config")
      .then((r) => r.json())
      .then((d) => {
        if (d && typeof d.voice === "string") {
          setConfigState({ voice: d.voice, hasKey: !!d.hasKey });
        }
      })
      .catch(() => {});
  }, []);

  const playBrowser = (text: string) =>
    new Promise<void>((resolve) => {
      if (typeof window === "undefined" || !window.speechSynthesis) {
        resolve();
        return;
      }
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "pt-BR";
      const voices = window.speechSynthesis.getVoices();
      const pt = voices.find((v) => v.lang?.toLowerCase().startsWith("pt"));
      if (pt) u.voice = pt;
      let settled = false;
      const done = () => {
        if (settled) return;
        settled = true;
        endCurrentRef.current = null;
        resolve();
      };
      endCurrentRef.current = () => {
        window.speechSynthesis.cancel();
        done();
      };
      u.onend = done;
      u.onerror = done;
      window.speechSynthesis.speak(u);
    });

  const playGoogle = async (
    audio: HTMLAudioElement,
    text: string,
    voice?: string,
  ) => {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, voice: voice || undefined }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.warn(`[voz] /api/tts retornou ${res.status}:`, body.slice(0, 200));
      return;
    }
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
  };

  const playNext = useCallback(async () => {
    if (playingRef.current) return;
    const item = queueRef.current.shift();
    if (!item) return;

    playingRef.current = true;
    try {
      const cfg = configRef.current;
      let voice = item.voice ?? cfg.voice;
      if (!cfg.hasKey) voice = FREE_VOICE;
      if (voice === FREE_VOICE) {
        await playBrowser(item.text);
      } else if (audioRef.current) {
        await playGoogle(audioRef.current, item.text, voice);
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
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
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

  const setVoice = useCallback((voice: string) => {
    setConfigState((prev) => ({ ...prev, voice }));
    fetch("/api/tts/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ voice }),
    }).catch(() => {});
  }, []);

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
        stop();
      }
      return next;
    });
  }, [playNext, stop]);

  return (
    <VoiceContext.Provider
      value={{ enabled, toggle, speak, stop, config, setVoice }}
    >
      {children}
    </VoiceContext.Provider>
  );
}
