"use client";

import { TicketsByPriority } from "@/components/dashboard/TicketsByPriority";
import { useTicketsAll } from "@/hooks/useTickets";

export function WidgetTicketsByPriority() {
  const { data, isLoading } = useTicketsAll();
  return <TicketsByPriority data={data?.byPriority} loading={isLoading} />;
}
