"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Clock, UserX } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface RecentTicket {
  id: number;
  name: string;
  type: number;
  typeLabel: string;
  statusLabel: string;
  priorityLabel: string;
  priorityColor: string;
  /** Nível numérico (1–6) — usado para destacar urgência. Já vem no payload. */
  priority: number;
  /** Técnico responsável; "Não atribuído" quando órfão. Já vem no payload. */
  technician: string;
  recipientName: string;
  location: string;
  date_creation: string;
  contentPreview?: string;
  sla: string;
  slaOverdue: boolean;
}

interface RecentTicketsListProps {
  data?: RecentTicket[];
  totalOpen?: number;
  loading?: boolean;
}

type ItemState = "enter" | "normal" | "leave";
type DisplayedTicket = RecentTicket & { _state: ItemState };

const LEAVE_DURATION_MS = 350;

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "agora";
  if (diffMins < 60) return `${diffMins}min`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d`;
}

export function RecentTicketsList({
  data,
  totalOpen,
  loading,
}: RecentTicketsListProps) {
  const [displayed, setDisplayed] = useState<DisplayedTicket[]>(() =>
    (data ?? []).map((t) => ({ ...t, _state: "normal" as const })),
  );
  const prevIdsRef = useRef<Set<number> | null>(null);

  useEffect(() => {
    if (!data) return;

    const newIds = new Set(data.map((t) => t.id));

    if (prevIdsRef.current === null) {
      setDisplayed(data.map((t) => ({ ...t, _state: "normal" as const })));
      prevIdsRef.current = newIds;
      return;
    }

    const prevIds = prevIdsRef.current;

    setDisplayed((current) => {
      const leaving: DisplayedTicket[] = current
        .filter((d) => d._state !== "leave" && !newIds.has(d.id))
        .map((d) => ({ ...d, _state: "leave" as const }));

      const items: DisplayedTicket[] = data.map((t) => ({
        ...t,
        _state: prevIds.has(t.id) ? "normal" : "enter",
      }));

      return [...items, ...leaving];
    });

    prevIdsRef.current = newIds;

    const timer = setTimeout(() => {
      setDisplayed((curr) => curr.filter((d) => d._state !== "leave"));
    }, LEAVE_DURATION_MS);
    return () => clearTimeout(timer);
  }, [data]);

  if (loading || !data) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-0.5 pt-1.5 px-3 flex-shrink-0">
          <CardTitle className="text-xs">Chamados Recentes</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 px-3 pb-2">
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Item de maior urgência (SLA vencido vence; depois prioridade alta). É ele
  // que recebe o destaque visual — não mais o "mais recente".
  const activeTickets = displayed.filter((d) => d._state !== "leave");
  let mostUrgentId: number | null = null;
  let mostUrgentScore = 0;
  for (const t of activeTickets) {
    const overdue = t.slaOverdue && t.sla !== "-";
    const qualifies = overdue || (t.priority ?? 0) >= 4;
    const score = (overdue ? 1000 : 0) + (t.priority ?? 0);
    if (qualifies && score > mostUrgentScore) {
      mostUrgentScore = score;
      mostUrgentId = t.id;
    }
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-0.5 pt-1.5 px-3 flex-shrink-0">
        <CardTitle className="text-xs flex items-center gap-2">
          Chamados Recentes
          <span
            className="inline-flex h-5 min-w-5 items-center justify-center rounded-full border border-glpi-primary/40 bg-glpi-primary/10 px-1.5 text-[10px] font-bold text-glpi-primary"
            title={
              totalOpen !== undefined && totalOpen > data.length
                ? `Exibindo ${data.length} dos ${totalOpen} chamados em aberto`
                : `${data.length} chamados em aberto`
            }
          >
            {totalOpen ?? data.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 px-0 pb-2">
        <ScrollArea className="h-full w-full px-2" type="auto">
          <div className="space-y-1 pr-2">
            {displayed.map((ticket, index) => {
              const isOverdue = ticket.slaOverdue && ticket.sla !== "-";
              const isUnassigned = ticket.technician === "Não atribuído";
              const isMostUrgent = ticket.id === mostUrgentId;
              const isNewest = index === 0;
              return (
                <div
                  key={ticket.id}
                  title={
                    ticket.contentPreview
                      ? `${ticket.name}\n\n${ticket.contentPreview}`
                      : ticket.name
                  }
                  className={cn(
                    "relative flex items-start gap-2 rounded-md px-2 py-1.5 transition-colors cursor-default",
                    // Fundo por urgência: vencido > mais urgente > mais recente
                    isOverdue
                      ? "bg-red-500/[0.07]"
                      : isMostUrgent
                        ? "bg-amber-500/[0.06]"
                        : isNewest
                          ? "bg-glpi-primary/[0.06]"
                          : "",
                    // Anel no item de maior urgência (foco único da lista)
                    isMostUrgent &&
                      (isOverdue
                        ? "ring-1 ring-inset ring-red-500/50"
                        : "ring-1 ring-inset ring-amber-500/40"),
                    ticket._state === "enter" && "animate-ticket-enter",
                    ticket._state === "leave" && "animate-ticket-leave",
                  )}
                >
                  {/* Tipo + sinal de chamado sem técnico */}
                  <div className="mt-0.5 flex shrink-0 flex-col items-center gap-1">
                    <span
                      className={cn(
                        // Tipo em tom NEUTRO (diferenciado por brilho), reservando
                        // vermelho/âmbar exclusivamente para urgência (SLA/prioridade).
                        "rounded px-1 py-0.5 text-[10px] font-bold uppercase leading-none",
                        ticket.type === 1
                          ? "bg-zinc-300/15 text-zinc-100"
                          : "bg-zinc-300/[0.06] text-zinc-400",
                      )}
                    >
                      {ticket.type === 1 ? "INC" : "REQ"}
                    </span>
                    {isUnassigned && (
                      <UserX
                        className="h-3 w-3 text-amber-500"
                        aria-label="Sem técnico"
                      >
                        <title>Sem técnico</title>
                      </UserX>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-medium leading-tight text-card-foreground">
                      {ticket.name}
                    </p>
                    <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                      {ticket.recipientName}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
                      {timeAgo(ticket.date_creation)}
                    </span>
                    <div className="flex items-center gap-1">
                      {ticket.sla !== "-" &&
                        (isOverdue ? (
                          <AlertTriangle
                            className="h-3.5 w-3.5 text-red-500 dark:text-red-400"
                            aria-label="SLA vencido"
                          >
                            <title>SLA vencido</title>
                          </AlertTriangle>
                        ) : (
                          <Clock
                            className="h-2.5 w-2.5 text-emerald-500 dark:text-emerald-400"
                            aria-label="SLA no prazo"
                          >
                            <title>SLA no prazo</title>
                          </Clock>
                        ))}
                      {/* Prioridade: dot discreto (no lugar da faixa lateral) */}
                      <span
                        className="inline-block h-2 w-2 rounded-full"
                        style={{ backgroundColor: ticket.priorityColor }}
                        title={ticket.priorityLabel}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
