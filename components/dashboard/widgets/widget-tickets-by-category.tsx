"use client";

import { TicketsByCategory } from "@/components/dashboard/TicketsByCategory";
import { useTicketsAll } from "@/hooks/useTickets";

export function WidgetTicketsByCategory() {
  const { data, isLoading } = useTicketsAll();
  return <TicketsByCategory data={data?.byCategory} loading={isLoading} />;
}
