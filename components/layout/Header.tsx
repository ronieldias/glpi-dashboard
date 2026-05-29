"use client";

import { usePathname } from "next/navigation";
import {
  RefreshCw,
  Menu,
  Sun,
  Moon,
  Filter,
  X,
  Calendar,
  Pencil,
  Save,
  XCircle,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useRef, useEffect } from "react";
import { useTheme } from "@/hooks/useTheme";
import { useFilter } from "@/hooks/useFilter";
import { useDashboardLayout } from "@/hooks/useDashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

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
  const { theme, toggleTheme } = useTheme();
  const { filter, setPreset, setCustomRange, clearFilter, filterLabel } =
    useFilter();
  const { editMode, enterEditMode, saveEdits, cancelEdits } =
    useDashboardLayout();
  const [filterOpen, setFilterOpen] = useState(false);
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const filterRef = useRef<HTMLDivElement>(null);

  const title = pageTitles[pathname] || "Dashboard";

  const handleRefresh = async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handlePreset = (preset: "day" | "week" | "month" | "year") => {
    setPreset(preset);
    setFilterOpen(false);
  };

  const handleApplyCustom = () => {
    if (customFrom && customTo) {
      setCustomRange(customFrom, customTo);
      setFilterOpen(false);
    }
  };

  const handleClear = () => {
    clearFilter();
    setCustomFrom("");
    setCustomTo("");
    setFilterOpen(false);
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    }
    if (filterOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [filterOpen]);

  return (
    <header className="sticky top-0 z-30 flex h-12 items-center justify-between border-b border-white/10 bg-glpi-dark px-4">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuToggle}
          aria-label="Menu"
          className="text-glpi-primary hover:bg-white/10"
        >
          <Menu />
        </Button>

        <img
          src="/logo-branca.png"
          alt="GLPI Dashboard"
          width={80}
          height={28}
          className="h-6 w-auto"
        />

        <Separator orientation="vertical" className="h-4 bg-white/10" />

        <h2 className="text-sm font-semibold text-white">{title}</h2>

        {filterLabel && (
          <FilterBadge label={filterLabel} onClear={handleClear} />
        )}

        {editMode && (
          <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-amber-400">
            <Pencil className="h-2.5 w-2.5" />
            Modo edição
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        {/* Botão de filtro: texto+ícone porque tem dropdown */}
        {!editMode && (
          <div className="relative" ref={filterRef}>
            <Button
              variant={filter.preset ? "outline" : "secondary"}
              onClick={() => setFilterOpen((o) => !o)}
              aria-haspopup="dialog"
              aria-expanded={filterOpen}
            >
              <Filter />
              Filtro
            </Button>

            {filterOpen && (
              <FilterDropdown
                filter={filter}
                customFrom={customFrom}
                customTo={customTo}
                onCustomFromChange={setCustomFrom}
                onCustomToChange={setCustomTo}
                onApplyCustom={handleApplyCustom}
                onPreset={handlePreset}
                onClear={handleClear}
              />
            )}
          </div>
        )}

        {/* Edit mode controls */}
        {editMode ? (
          <>
            <Button variant="destructive" onClick={cancelEdits}>
              <XCircle />
              Cancelar
            </Button>
            <Button variant="outline" onClick={saveEdits}>
              <Save />
              Salvar
            </Button>
          </>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                onClick={enterEditMode}
                aria-label="Editar layout"
              >
                <Pencil />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Editar layout</TooltipContent>
          </Tooltip>
        )}

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="secondary"
              size="icon"
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Tema claro" : "Tema escuro"}
            >
              {theme === "dark" ? <Sun /> : <Moon />}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {theme === "dark" ? "Tema claro" : "Tema escuro"}
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="secondary"
              size="icon"
              onClick={handleRefresh}
              aria-label="Atualizar dados"
              disabled={refreshing}
            >
              <RefreshCw className={cn(refreshing && "animate-spin")} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {refreshing ? "Atualizando…" : "Atualizar dados"}
          </TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="mx-1 h-4 bg-white/10" />

        {/* Status de conexão como dot com tooltip */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label="Status da conexão"
              className="flex items-center gap-1.5 rounded-md px-1.5 py-1 text-[10px] text-zinc-400 hover:text-white"
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              <span className="hidden md:inline">Online</span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            Conectado ao GLPI · atualiza a cada 30s
          </TooltipContent>
        </Tooltip>
      </div>
    </header>
  );
}

/** Badge que mostra o filtro de período ativo, com botão de fechar inline. */
function FilterBadge({
  label,
  onClear,
}: {
  label: string;
  onClear: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-glpi-primary/30 bg-glpi-primary/10 px-2 py-0.5 text-[10px] font-medium text-glpi-primary">
      <Calendar className="h-2.5 w-2.5" />
      {label}
      <button
        type="button"
        onClick={onClear}
        className="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-glpi-primary/20"
        aria-label="Limpar filtro"
      >
        <X className="h-2.5 w-2.5" />
      </button>
    </span>
  );
}

interface FilterDropdownProps {
  filter: { preset: string | null };
  customFrom: string;
  customTo: string;
  onCustomFromChange: (v: string) => void;
  onCustomToChange: (v: string) => void;
  onApplyCustom: () => void;
  onPreset: (preset: "day" | "week" | "month" | "year") => void;
  onClear: () => void;
}

function FilterDropdown({
  filter,
  customFrom,
  customTo,
  onCustomFromChange,
  onCustomToChange,
  onApplyCustom,
  onPreset,
  onClear,
}: FilterDropdownProps) {
  return (
    <div
      role="dialog"
      aria-label="Filtrar por período"
      className="absolute right-0 top-full z-50 mt-1.5 w-72 overflow-hidden rounded-lg border border-border bg-card shadow-xl animate-in fade-in-0 zoom-in-95"
    >
      <div className="border-b border-border p-3">
        <p className="text-xs font-semibold text-card-foreground">
          Filtrar por período
        </p>
      </div>

      <div className="grid grid-cols-2 gap-1.5 p-3">
        {(["day", "week", "month", "year"] as const).map((p) => {
          const labels: Record<string, string> = {
            day: "Hoje",
            week: "Esta semana",
            month: "Este mês",
            year: "Este ano",
          };
          const isActive = filter.preset === p;
          return (
            <Button
              key={p}
              variant={isActive ? "default" : "secondary"}
              size="sm"
              onClick={() => onPreset(p)}
              className="justify-center"
            >
              {labels[p]}
            </Button>
          );
        })}
      </div>

      <div className="border-t border-border p-3">
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Intervalo personalizado
        </p>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-1.5">
          <input
            type="date"
            value={customFrom}
            onChange={(e) => onCustomFromChange(e.target.value)}
            className="min-w-0 rounded-md border border-border bg-input-bg px-2 py-1 text-[11px] text-card-foreground focus:border-glpi-primary focus:outline-none focus:ring-1 focus:ring-glpi-primary/30"
          />
          <span className="text-[10px] text-muted-foreground">→</span>
          <input
            type="date"
            value={customTo}
            onChange={(e) => onCustomToChange(e.target.value)}
            className="min-w-0 rounded-md border border-border bg-input-bg px-2 py-1 text-[11px] text-card-foreground focus:border-glpi-primary focus:outline-none focus:ring-1 focus:ring-glpi-primary/30"
          />
        </div>
        <Button
          variant="default"
          size="sm"
          onClick={onApplyCustom}
          disabled={!customFrom || !customTo}
          className="mt-2 w-full justify-center"
        >
          Aplicar
        </Button>
      </div>

      {filter.preset && (
        <div className="border-t border-border p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="w-full justify-center"
          >
            Limpar filtro
          </Button>
        </div>
      )}
    </div>
  );
}
