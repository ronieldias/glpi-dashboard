"use client";

import { RecentTicketsList } from "@/components/dashboard/RecentTicketsList";
import { useTicketsAll } from "@/hooks/useTickets";

export function WidgetRecentTickets() {
  const { data, isLoading } = useTicketsAll();
  return (
    <RecentTicketsList
      data={data?.recent}
      totalOpen={data?.kpis?.totalOpen}
      loading={isLoading}
    />
  );
}
