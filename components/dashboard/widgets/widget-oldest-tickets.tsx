"use client";

import { OldestTickets } from "@/components/dashboard/OldestTickets";
import { useTicketsAll } from "@/hooks/useTickets";

export function WidgetOldestTickets() {
  const { data, isLoading } = useTicketsAll();
  return <OldestTickets data={data?.oldestOpen} loading={isLoading} />;
}
