"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { VoiceControls } from "@/components/voice/VoiceControls";

const TITLES: Record<string, string> = {
  "/tv/overview": "Visão geral",
  "/tv/tickets": "Chamados",
  "/tv/projects": "Projetos",
};

const NAV: Array<{ href: string; label: string; key: string }> = [
  { href: "/tv/overview", label: "Overview", key: "1" },
  { href: "/tv/tickets", label: "Chamados", key: "2" },
  { href: "/tv/projects", label: "Projetos", key: "3" },
];

export function TVHeader() {
  const pathname = usePathname();
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="flex shrink-0 items-center justify-between border-b border-zinc-800/80 bg-zinc-950/60 px-6 py-3 text-zinc-100">
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 tv-live-dot"
            aria-hidden
          />
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
            Fadex Helpdesk
          </span>
        </div>

        <div className="h-4 w-px bg-zinc-800" aria-hidden />

        <nav className="flex items-center gap-1 rounded-md border border-zinc-800/80 bg-zinc-900/60 p-0.5">
          {NAV.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <span
                key={item.href}
                className={[
                  "rounded-[5px] px-2.5 py-1 text-[11px] font-medium transition-colors",
                  active
                    ? "bg-zinc-800 text-zinc-100"
                    : "text-zinc-500",
                ].join(" ")}
              >
                {item.label}
                <span className="ml-1.5 text-[9px] text-zinc-600">
                  {item.key}
                </span>
              </span>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <VoiceControls />
        {now && (
          <>
            <span className="text-xs uppercase tracking-wide text-zinc-500">
              {now.toLocaleDateString("pt-BR", {
                weekday: "short",
                day: "2-digit",
                month: "short",
              })}
            </span>
            <span className="font-mono text-xl font-semibold tabular-nums leading-none tracking-tight text-zinc-100">
              {now.toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })}
            </span>
          </>
        )}
      </div>
    </header>
  );
}
