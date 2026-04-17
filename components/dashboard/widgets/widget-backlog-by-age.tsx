"use client";

import { BacklogByAge } from "@/components/dashboard/BacklogByAge";
import { useTicketsAll } from "@/hooks/useTickets";

export function WidgetBacklogByAge() {
  const { data, isLoading } = useTicketsAll();
  return <BacklogByAge data={data?.backlogByAge} loading={isLoading} />;
}
