"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { RefreshCw, Menu } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

const pageTitles: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/tickets": "Dashboard de Chamados",
  "/dashboard/projects": "Dashboard de Projetos",
};

interface HeaderProps {
  onMenuToggle: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const title = pageTitles[pathname] || "Dashboard";

  const handleRefresh = async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries();
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <header className="sticky top-0 z-30 flex h-10 items-center justify-between border-b border-glpi-border bg-glpi-dark px-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="rounded p-1 hover:bg-white/10"
          title="Menu"
        >
          <Menu className="h-5 w-5 text-glpi-primary" />
        </button>
        <Image
          src="/logo-fadex.png"
          alt="FADEX"
          width={80}
          height={28}
          className="h-6 w-auto"
          priority
        />
        <div className="h-4 w-px bg-gray-600" />
        <h2 className="text-sm font-semibold text-white">{title}</h2>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={handleRefresh}
          className="flex items-center gap-1.5 rounded border border-gray-600 px-2 py-1 text-xs text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
          title="Atualizar dados"
        >
          <RefreshCw className={`h-3 w-3 ${refreshing ? "animate-spin" : ""}`} />
          Atualizar
        </button>
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-glpi-primary" />
          <span className="text-[10px] text-gray-400">Conectado</span>
        </div>
      </div>
    </header>
  );
}
