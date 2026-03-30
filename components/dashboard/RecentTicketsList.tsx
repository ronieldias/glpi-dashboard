"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { TicketTypeLabel } from "@/types/glpi";

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
  sla: string;
  slaOverdue: boolean;
}

interface RecentTicketsListProps {
  data?: RecentTicket[];
  loading?: boolean;
}

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

export function RecentTicketsList({ data, loading }: RecentTicketsListProps) {
  if (loading || !data) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-1 pt-3 px-3">
          <CardTitle className="text-xs">Chamados Recentes</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 px-3 pb-2">
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
      <CardHeader className="pb-1 pt-3 px-3">
        <CardTitle className="text-xs flex items-center gap-2">
          Chamados Recentes
          <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-glpi-primary text-[8px] text-white font-bold">
            {data.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto px-2 pb-2">
        <div className="space-y-1">
          {data.map((ticket, index) => (
            <div
              key={ticket.id}
              className={cn(
                "flex items-start gap-2 rounded-md px-2 py-1.5 transition-colors",
                index === 0 && "bg-glpi-primary/10 border border-glpi-primary/20 animate-pulse-once"
              )}
            >
              {/* Indicador de tipo */}
              <div className={cn(
                "mt-0.5 shrink-0 rounded px-1 py-0.5 text-[8px] font-bold uppercase",
                ticket.type === 1 ? "bg-red-100 text-red-700" : "bg-glpi-primary/20 text-glpi-primary-dark"
              )}>
                {ticket.type === 1 ? "INC" : "REQ"}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium text-gray-900 truncate leading-tight">
                  {ticket.name}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[9px] text-gray-500">{ticket.recipientName}</span>
                  {ticket.location && ticket.location !== "0" && ticket.location !== "-" && (
                    <>
                      <span className="text-[9px] text-gray-300">|</span>
                      <span className="text-[9px] text-gray-400">{ticket.location}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Meta */}
              <div className="shrink-0 text-right flex flex-col items-end gap-0.5">
                <span className="text-[9px] text-gray-400">{timeAgo(ticket.date_creation)}</span>
                <span
                  className="inline-block h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: ticket.priorityColor }}
                  title={ticket.priorityLabel}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
