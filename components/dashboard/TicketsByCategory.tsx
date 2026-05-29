"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { ChartDataItem } from "@/types/glpi";

interface TicketsByCategoryProps {
  data?: ChartDataItem[];
  loading?: boolean;
}

const PAGE_SIZE = 5;
const ROTATION_MS = 5000;

/**
 * Top 10 Categorias — lista paginada com rotação automática (igual ao
 * "Ranking por Técnico"): mostra PAGE_SIZE categorias por vez, com barra de
 * progresso enchendo em ROTATION_MS e dots de paginação. Paginar em vez de
 * espremer as 10 dá respiro a cada linha e mantém o ritmo visual do painel.
 *
 * Cada linha: posição · nome (caminho profundo encurtado, "… › pai › folha")
 * · valor + %. A proporção é o preenchimento de fundo (data bar), então o
 * nome usa toda a largura disponível.
 */
export function TicketsByCategory({ data, loading }: TicketsByCategoryProps) {
  const [pageIndex, setPageIndex] = useState(0);

  const totalPages = data ? Math.max(1, Math.ceil(data.length / PAGE_SIZE)) : 1;
  const needsRotation = totalPages > 1;

  useEffect(() => {
    if (!needsRotation) return;
    const id = setInterval(() => {
      setPageIndex((p) => (p + 1) % totalPages);
    }, ROTATION_MS);
    return () => clearInterval(id);
  }, [needsRotation, totalPages]);

  useEffect(() => {
    setPageIndex(0);
  }, [data?.length]);

  useEffect(() => {
    if (pageIndex >= totalPages) setPageIndex(0);
  }, [pageIndex, totalPages]);

  const pageData = useMemo(() => {
    if (!data) return [];
    const start = pageIndex * PAGE_SIZE;
    return data.slice(start, start + PAGE_SIZE);
  }, [data, pageIndex]);

  if (loading || !data) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-1 pt-2 px-3 flex-shrink-0">
          <CardTitle className="text-xs">Top 10 Categorias</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 px-3 pb-2 flex flex-col justify-around">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-3 w-5" />
              <Skeleton className="h-3 flex-1" />
              <Skeleton className="h-4 w-8" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-1 pt-2 px-3 flex-shrink-0">
          <CardTitle className="text-xs">Top 10 Categorias</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 flex items-center justify-center px-3 pb-2">
          <p className="text-[10px] text-muted-foreground">
            Sem dados de categoria
          </p>
        </CardContent>
      </Card>
    );
  }

  const max = Math.max(...data.map((d) => d.value)) || 1;
  const total = data.reduce((s, d) => s + d.value, 0);
  const startPosition = pageIndex * PAGE_SIZE;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-1 pt-2 px-3 flex-shrink-0 flex flex-row items-baseline justify-between gap-2">
        <CardTitle className="text-xs">Top 10 Categorias</CardTitle>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground tabular-nums">
          {data.length} categorias · {total} tickets
        </span>
      </CardHeader>

      {/* Barra de progresso da rotação (só aparece se paginando) */}
      {needsRotation && (
        <div className="relative h-0.5 w-full bg-progress-track overflow-hidden flex-shrink-0">
          <div
            key={pageIndex}
            className="absolute inset-y-0 left-0 bg-glpi-primary tv-rotation-fill"
          />
        </div>
      )}

      <CardContent className="flex-1 min-h-0 flex flex-col overflow-hidden px-3 pb-2 gap-1">
        <ol key={pageIndex} className="flex-1 min-h-0 flex flex-col justify-around">
          {pageData.map((row, idx) => (
            <CategoryRow
              key={row.name + idx}
              position={startPosition + idx + 1}
              name={row.name}
              value={row.value}
              max={max}
              total={total}
              staggerDelay={idx * 80}
            />
          ))}
        </ol>

        {/* Dots de paginação (só se paginando) */}
        {needsRotation && (
          <div
            className="flex shrink-0 items-center justify-center gap-1.5 pt-0.5"
            role="tablist"
            aria-label="Paginação das categorias"
          >
            {Array.from({ length: totalPages }).map((_, i) => (
              <span
                key={i}
                role="tab"
                aria-selected={i === pageIndex}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-500",
                  i === pageIndex
                    ? "w-4 bg-glpi-primary"
                    : "w-1.5 bg-muted-foreground/30",
                )}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface CategoryRowProps {
  position: number;
  name: string;
  value: number;
  max: number;
  total: number;
  staggerDelay?: number;
}

function CategoryRow({
  position,
  name,
  value,
  max,
  total,
  staggerDelay = 0,
}: CategoryRowProps) {
  const pct = (value / max) * 100;
  const share = total > 0 ? Math.round((value / total) * 100) : 0;
  const isTop3 = position <= 3;
  const leaf = categoryLeaf(name);

  return (
    <li
      style={{ animationDelay: `${staggerDelay}ms` }}
      className={cn(
        // posição · nome (largura total) · valor. A proporção é o preenchimento
        // de fundo (data bar), então o nome cabe em qualquer largura do widget.
        // px-2 dá respiro horizontal ao texto sobre a barra.
        "tv-row-slide-in relative grid grid-cols-[1.1rem_minmax(0,1fr)_auto] items-center gap-2 py-0.5 px-2",
        "border-b border-border/60 last:border-b-0",
        "transition-colors hover:bg-muted/20",
      )}
    >
      {/* Barra de proporção como preenchimento de fundo (data bar) — recuada
          verticalmente para não encostar nas divisórias (respiro). */}
      <div
        className={cn(
          "absolute inset-y-[3px] left-0 z-0 rounded transition-all duration-500",
          isTop3 ? "bg-violet-500/25" : "bg-violet-500/[0.12]",
        )}
        style={{ width: `${pct}%` }}
        aria-hidden
      />

      {/* Posição */}
      <span
        className={cn(
          "relative z-10 text-right font-mono text-[10px] tabular-nums",
          isTop3 ? "font-bold text-card-foreground" : "text-muted-foreground",
        )}
      >
        {position}
      </span>

      {/* Apenas o último nome (folha) — caminho completo fica no tooltip */}
      <span
        className="relative z-10 truncate text-[11px] font-medium leading-tight text-card-foreground"
        title={name}
      >
        {leaf}
      </span>

      {/* Valor + % do total */}
      <div className="relative z-10 flex items-baseline justify-end gap-1.5">
        <span
          className={cn(
            "font-mono text-xs font-bold tabular-nums",
            isTop3 ? "text-card-foreground" : "text-muted-foreground",
          )}
        >
          {value}
        </span>
        <span className="w-7 text-right font-mono text-[9px] tabular-nums text-muted-foreground/70">
          {share}%
        </span>
      </div>
    </li>
  );
}

/**
 * Último segmento (folha) do nome da categoria. Separa só por `>` — o
 * separador de hierarquia do GLPI — preservando `/` que aparece dentro de
 * nomes (ex.: "Microsoft 365 / Google Workspace", "Computador/Notebook").
 * Exemplos:
 *   "Sistemas > SAGI > Erros e Falhas"  → "Erros e Falhas"
 *   "Sistemas > Microsoft 365 / Google" → "Microsoft 365 / Google"
 *   "Sem categoria"                     → "Sem categoria"
 */
function categoryLeaf(raw: string): string {
  const parts = raw.split(">").map((p) => p.trim()).filter(Boolean);
  return parts.length > 0 ? parts[parts.length - 1] : raw.trim();
}
