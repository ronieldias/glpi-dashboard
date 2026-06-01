"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Pause, Play } from "lucide-react";

const ROUTES = ["/tv/overview", "/tv/tickets", "/tv/projects"] as const;
const ROTATION_MS = 30_000;
const STORAGE_KEY = "tv-rotation-paused";

export function TVRotator() {
  const router = useRouter();
  const pathname = usePathname();
  const [paused, setPaused] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored === "true") setPaused(true);
    } catch {
    }
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, String(paused));
    } catch {
    }
  }, [paused]);

  useEffect(() => {
    if (paused) return;

    const currentIdx = ROUTES.findIndex((r) => pathname.startsWith(r));
    if (currentIdx === -1) return;

    timeoutRef.current = setTimeout(() => {
      const nextIdx = (currentIdx + 1) % ROUTES.length;
      router.push(ROUTES[nextIdx]);
    }, ROTATION_MS);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [pathname, paused, router]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA") return;

      const key = e.key.toLowerCase();
      if (key === "f") {
        e.preventDefault();
        toggleFullscreen();
      } else if (key === "r" || key === " ") {
        e.preventDefault();
        setPaused((p) => !p);
      } else if (key === "1") {
        e.preventDefault();
        router.push(ROUTES[0]);
      } else if (key === "2") {
        e.preventDefault();
        router.push(ROUTES[1]);
      } else if (key === "3") {
        e.preventDefault();
        router.push(ROUTES[2]);
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [router]);

  return (
    <button
      type="button"
      onClick={() => setPaused((p) => !p)}
      aria-label={paused ? "Retomar rotação" : "Pausar rotação"}
      className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-3 py-1.5 text-xs text-white/80 backdrop-blur-sm transition-opacity hover:opacity-100 opacity-30"
    >
      {paused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
      <span className="font-mono uppercase tracking-wider">
        {paused ? "Pausado" : "Rotação 30s"}
      </span>
    </button>
  );
}

function toggleFullscreen() {
  const doc = document as Document & {
    webkitFullscreenElement?: Element | null;
    webkitExitFullscreen?: () => Promise<void>;
  };
  const root = document.documentElement as HTMLElement & {
    webkitRequestFullscreen?: () => Promise<void>;
  };
  const isFs = !!(document.fullscreenElement || doc.webkitFullscreenElement);
  if (isFs) {
    (document.exitFullscreen?.() ?? doc.webkitExitFullscreen?.())?.catch(
      () => {},
    );
  } else {
    (root.requestFullscreen?.() ?? root.webkitRequestFullscreen?.())?.catch(
      () => {},
    );
  }
}
