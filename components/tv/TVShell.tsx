"use client";

import { type ReactNode, useEffect } from "react";
import { usePathname } from "next/navigation";
import { TVHeader } from "./TVHeader";
import { TVRotator } from "./TVRotator";

const CURSOR_HIDE_DELAY_MS = 3000;

/**
 * Wrapper client-side do layout TV. Responsabilidades:
 * - Esconde o cursor após 3s sem movimento (modo "kiosk")
 * - Renderiza header fixo + rotator + conteúdo
 */
export function TVShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    const showCursor = () => {
      document.body.style.cursor = "default";
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        document.body.style.cursor = "none";
      }, CURSOR_HIDE_DELAY_MS);
    };
    showCursor();
    window.addEventListener("mousemove", showCursor);
    return () => {
      window.removeEventListener("mousemove", showCursor);
      if (timer) clearTimeout(timer);
      document.body.style.cursor = "";
    };
  }, []);

  return (
    <div className="tv-shell-bg flex h-screen flex-col overflow-hidden text-white">
      <TVHeader />
      <main className="min-h-0 flex-1 overflow-hidden p-6">
        <div key={pathname} className="h-full tv-card-enter">
          {children}
        </div>
      </main>
      <TVRotator />
    </div>
  );
}
