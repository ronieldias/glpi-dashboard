"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { RefreshCw, Menu, Sun, Moon, Filter, X, Calendar, Pencil, Save, XCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useRef, useEffect } from "react";
import { useTheme } from "@/hooks/useTheme";
import { useFilter } from "@/hooks/useFilter";
import { useDashboardLayout } from "@/hooks/useDashboardLayout";

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
  const { filter, setPreset, setCustomRange, clearFilter, filterLabel } = useFilter();
  const { editMode, enterEditMode, saveEdits, cancelEdits } = useDashboardLayout();
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

  // Fechar ao clicar fora
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    }
    if (filterOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [filterOpen]);

  return (
    <header className="sticky top-0 z-30 flex h-12 items-center justify-between border-b border-header-border bg-glpi-dark px-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="rounded p-1 hover:bg-white/10"
          title="Menu"
        >
          <Menu className="h-5 w-5 text-glpi-primary" />
        </button>
        <Image
          src="/logo-branca.webp"
          alt="FADEX"
          width={80}
          height={28}
          className="h-6 w-auto"
          priority
        />
        <div className="h-4 w-px bg-gray-600" />
        <h2 className="text-sm font-semibold text-white">{title}</h2>

        {/* Badge do filtro ativo */}
        {filterLabel && (
          <div className="flex items-center gap-1 rounded bg-glpi-primary/20 px-2 py-0.5">
            <Calendar className="h-3 w-3 text-glpi-primary" />
            <span className="text-[10px] font-medium text-glpi-primary">{filterLabel}</span>
            <button
              onClick={handleClear}
              className="ml-0.5 rounded-full p-0.5 hover:bg-white/10"
              title="Limpar filtro"
            >
              <X className="h-2.5 w-2.5 text-glpi-primary" />
            </button>
          </div>
        )}

        {/* Edit mode indicator */}
        {editMode && (
          <div className="flex items-center gap-1 rounded bg-amber-500/20 px-2 py-0.5">
            <Pencil className="h-3 w-3 text-amber-400" />
            <span className="text-[10px] font-medium text-amber-400">Modo edição</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Botao de filtro */}
        {!editMode && (
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setFilterOpen((o) => !o)}
              className={`flex items-center gap-1.5 rounded border px-2 py-1 text-xs transition-colors ${
                filter.preset
                  ? "border-glpi-primary bg-glpi-primary/10 text-glpi-primary"
                  : "border-gray-600 text-gray-300 hover:bg-white/10 hover:text-white"
              }`}
              title="Filtrar por periodo"
            >
              <Filter className="h-3 w-3" />
              Filtro
            </button>

            {/* Dropdown de filtros */}
            {filterOpen && (
              <div className="absolute right-0 top-full mt-1 w-72 rounded border bg-card shadow-xl z-50 overflow-hidden">
                <div className="border-b p-3">
                  <p className="text-xs font-semibold text-card-foreground">Filtrar por periodo</p>
                </div>

                {/* Presets */}
                <div className="grid grid-cols-2 gap-1.5 p-3">
                  {(["day", "week", "month", "year"] as const).map((p) => {
                    const labels: Record<string, string> = {
                      day: "Hoje",
                      week: "Esta semana",
                      month: "Este mes",
                      year: "Este ano",
                    };
                    return (
                      <button
                        key={p}
                        onClick={() => handlePreset(p)}
                        className={`rounded px-3 py-1.5 text-xs font-medium transition-colors ${
                          filter.preset === p
                            ? "bg-glpi-primary text-white"
                            : "bg-skeleton text-card-foreground hover:bg-[var(--color-hover)]"
                        }`}
                      >
                        {labels[p]}
                      </button>
                    );
                  })}
                </div>

                {/* Intervalo customizado */}
                <div className="border-t p-3">
                  <p className="mb-2 text-[10px] font-medium text-muted uppercase tracking-wider">Intervalo personalizado</p>
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-1.5">
                    <input
                      type="date"
                      value={customFrom}
                      onChange={(e) => setCustomFrom(e.target.value)}
                      className="min-w-0 rounded border bg-input-bg px-1.5 py-1 text-[11px] text-card-foreground"
                    />
                    <span className="text-[10px] text-muted">a</span>
                    <input
                      type="date"
                      value={customTo}
                      onChange={(e) => setCustomTo(e.target.value)}
                      className="min-w-0 rounded border bg-input-bg px-1.5 py-1 text-[11px] text-card-foreground"
                    />
                  </div>
                  <button
                    onClick={handleApplyCustom}
                    disabled={!customFrom || !customTo}
                    className="mt-2 w-full rounded bg-glpi-primary px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-glpi-primary-dark disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Aplicar
                  </button>
                </div>

                {/* Limpar */}
                {filter.preset && (
                  <div className="border-t p-2">
                    <button
                      onClick={handleClear}
                      className="w-full rounded px-3 py-1 text-xs text-muted hover:bg-[var(--color-hover)] hover:text-card-foreground transition-colors"
                    >
                      Limpar filtro
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Edit mode: Save / Cancel buttons */}
        {editMode ? (
          <>
            <button
              onClick={cancelEdits}
              className="flex items-center gap-1.5 rounded border border-gray-600 px-2 py-1 text-xs text-gray-300 transition-colors hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-400"
              title="Cancelar alterações"
            >
              <XCircle className="h-3 w-3" />
              Cancelar
            </button>
            <button
              onClick={saveEdits}
              className="flex items-center gap-1.5 rounded border border-glpi-primary bg-glpi-primary/20 px-2 py-1 text-xs text-glpi-primary transition-colors hover:bg-glpi-primary hover:text-white"
              title="Salvar layout"
            >
              <Save className="h-3 w-3" />
              Salvar
            </button>
          </>
        ) : (
          <button
            onClick={enterEditMode}
            className="flex items-center justify-center rounded border border-gray-600 p-1 text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
            title="Editar layout"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        )}

        <button
          onClick={toggleTheme}
          className="flex items-center justify-center rounded border border-gray-600 p-1 text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
          title={theme === "dark" ? "Tema claro" : "Tema escuro"}
        >
          {theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
        </button>
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
