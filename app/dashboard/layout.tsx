"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { DashboardProvider } from "@/providers/dashboard-provider";
import { FilterAssignmentProvider } from "@/providers/filter-assignment-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <DashboardProvider page={pathname}>
      <FilterAssignmentProvider page={pathname}>
        <div className="h-screen flex flex-col">
          <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <Header onMenuToggle={() => setSidebarOpen((o) => !o)} />
          <main className="flex-1 min-h-0 overflow-hidden p-2">{children}</main>
        </div>
      </FilterAssignmentProvider>
    </DashboardProvider>
  );
}
