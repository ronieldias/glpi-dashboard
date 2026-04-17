"use client";

import { SLAIndicator } from "@/components/dashboard/SLAIndicator";
import { useTicketsAll } from "@/hooks/useTickets";

export function WidgetSLAIndicator() {
  const { data, isLoading } = useTicketsAll();
  return <SLAIndicator data={data?.byType} loading={isLoading} />;
}
