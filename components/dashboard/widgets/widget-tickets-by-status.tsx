"use client";

import { TicketsByStatus } from "@/components/dashboard/TicketsByStatus";
import { useTicketsAll } from "@/hooks/useTickets";

export function WidgetTicketsByStatus() {
  const { data, isLoading } = useTicketsAll();
  return <TicketsByStatus data={data?.byStatus} loading={isLoading} />;
}
