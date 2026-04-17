"use client";

import { TicketsTrend } from "@/components/dashboard/TicketsTrend";
import { useTicketsAll } from "@/hooks/useTickets";

export function WidgetTicketsTrend() {
  const { data, isLoading } = useTicketsAll();
  return <TicketsTrend data={data?.trend} loading={isLoading} />;
}
