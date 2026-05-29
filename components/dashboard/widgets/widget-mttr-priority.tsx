"use client";

import { MttrByPriority } from "@/components/dashboard/MttrByPriority";
import { useTicketsAll } from "@/hooks/useTickets";

export function WidgetMttrPriority() {
  const { data, isLoading } = useTicketsAll();
  return (
    <MttrByPriority
      data={data?.kpis?.mttrByPriority}
      loading={isLoading}
    />
  );
}
