"use client";

import { CurrentLoad } from "@/components/dashboard/CurrentLoad";
import { useTicketsAll } from "@/hooks/useTickets";

export function WidgetCurrentLoad() {
  const { data, isLoading } = useTicketsAll();
  return (
    <CurrentLoad
      load={data?.kpis?.currentLoadByTech}
      byTech={data?.loadByTechAge}
      byCategory={data?.openByCategory}
      loading={isLoading}
    />
  );
}
