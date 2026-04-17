"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Clock } from "lucide-react";
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

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-0.5 pt-1.5 px-3 flex-shrink-0">
        <CardTitle className="text-xs flex items-center gap-2">
          Chamados Recentes
          <span
            className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-glpi-primary px-1 text-[8px] font-bold text-white"
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
            {displayed.map((ticket, index) => (
              <div
                key={ticket.id}
                title={
                  ticket.contentPreview
                    ? `${ticket.name}\n\n${ticket.contentPreview}`
                    : ticket.name
                }
                className={cn(
                  "flex items-start gap-2 rounded-md px-2 py-1.5 transition-colors cursor-default",
                  index === 0 &&
                    ticket._state !== "leave" &&
                    "bg-glpi-primary/10 border border-glpi-primary/20 animate-pulse-once",
                  ticket._state === "enter" && "animate-ticket-enter",
                  ticket._state === "leave" && "animate-ticket-leave",
                )}
              >
                <div
                  className={cn(
                    "mt-0.5 shrink-0 rounded px-1 py-0.5 text-[10px] font-bold uppercase",
                    ticket.type === 1
                      ? "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400"
                      : "bg-glpi-primary/20 text-glpi-primary-dark",
                  )}
                >
                  {ticket.type === 1 ? "INC" : "REQ"}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium text-card-foreground truncate leading-tight">
                    {ticket.name}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[11px] text-muted">
                      {ticket.recipientName}
                    </span>
                    {ticket.location &&
                      ticket.location !== "0" &&
                      ticket.location !== "-" && (
                        <>
                          <span className="text-[11px] text-muted-foreground">
                            |
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {ticket.location}
                          </span>
                        </>
                      )}
                  </div>
                </div>

                <div className="shrink-0 text-right flex flex-col items-end gap-0.5">
                  <span className="text-[11px] text-muted-foreground">
                    {timeAgo(ticket.date_creation)}
                  </span>
                  <div className="flex items-center gap-1">
                    {ticket.sla !== "-" &&
                      (ticket.slaOverdue ? (
                        <AlertTriangle
                          className="h-2.5 w-2.5 text-red-500 dark:text-red-400"
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
                    <span
                      className="inline-block h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: ticket.priorityColor }}
                      title={ticket.priorityLabel}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
