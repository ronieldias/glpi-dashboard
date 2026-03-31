"use client";

import { TicketsByTechnician } from "@/components/dashboard/TicketsByTechnician";
import { useTicketsAll } from "@/hooks/useTickets";

export function WidgetTicketsByTechnician() {
  const { data, isLoading } = useTicketsAll();
  return <TicketsByTechnician data={data?.byTechnician} loading={isLoading} />;
}
