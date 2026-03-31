"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Ticket,
  FolderKanban,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";

const navItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Chamados", href: "/dashboard/tickets", icon: Ticket },
  { label: "Projetos", href: "/dashboard/projects", icon: FolderKanban },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { theme } = useTheme();

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      <aside className="fixed left-0 top-0 z-50 flex h-screen w-56 flex-col bg-glpi-dark shadow-xl">
        <div className="flex h-12 items-center justify-between border-b border-header-border px-4">
          <div className="flex items-center gap-2">
            <Image
              src={theme === "dark" ? "/logo-branca.webp" : "/logo-preta.webp"}
              alt="FADEX"
              width={80}
              height={28}
              className="h-5 w-auto"
            />
            <span className="text-xs text-gray-400">Dashboard</span>
          </div>
          <button onClick={onClose} className="rounded p-1 hover:bg-white/10">
            <X className="h-4 w-4 text-gray-400" />
          </button>
        </div>
        <nav className="flex-1 space-y-1 px-2 py-3">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-glpi-primary/20 text-glpi-primary"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-header-border p-3">
          <p className="text-[10px] text-gray-500">FADEX - Dashboard GLPI</p>
        </div>
      </aside>
    </>
  );
}
