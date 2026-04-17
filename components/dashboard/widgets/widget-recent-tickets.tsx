"use client";

import { RecentTicketsList } from "@/components/dashboard/RecentTicketsList";
import { useTicketsAll } from "@/hooks/useTickets";
import { useTicketAnnouncer } from "@/hooks/useTicketAnnouncer";

export function WidgetRecentTickets() {
  const { data, isLoading } = useTicketsAll();
  useTicketAnnouncer(data?.recent);
  return (
    <RecentTicketsList
      data={data?.recent}
      totalOpen={data?.kpis?.totalOpen}
      loading={isLoading}
    />
  );
}
