import { NextRequest, NextResponse } from "next/server";
import { glpiFetch } from "@/lib/glpi-client";
import type {
  GLPITicket,
  GLPIUser,
  TicketKPIs,
  ChartDataItem,
  TrendDataItem,
} from "@/types/glpi";
import {
  TicketStatus,
  TicketStatusLabel,
  TicketStatusColor,
  TicketPriorityLabel,
  TicketPriorityColor,
  TicketType,
  TicketTypeLabel,
} from "@/types/glpi";

// Mapa de username -> "Firstname Realname"
type UserMap = Record<string, string>;

async function fetchUserMap(): Promise<UserMap> {
  const users = await glpiFetch<GLPIUser[]>("/User", {
    range: "0-500",
  });
  const map: UserMap = {};
  users.forEach((u) => {
    const fullName = [u.firstname, u.realname].filter(Boolean).join(" ").trim();
    map[u.name] = fullName || u.name;
    // Tambem mapear por id (caso expand_dropdowns retorne o name)
    map[String(u.id)] = fullName || u.name;
  });
  return map;
}

function resolveUserName(raw: string | unknown, userMap: UserMap): string {
  const key = String(raw || "").trim();
  if (!key || key === "0") return "-";
  return userMap[key] || key;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const view = searchParams.get("view") || "all";

    // Buscar chamados e usuarios em paralelo
    const [tickets, userMap] = await Promise.all([
      glpiFetch<GLPITicket[]>("/Ticket", {
        range: "0-500",
        expand_dropdowns: "true",
      }),
      fetchUserMap(),
    ]);

    if (view === "kpis") {
      return NextResponse.json(buildKPIs(tickets));
    }

    if (view === "by-status") {
      return NextResponse.json(buildByStatus(tickets));
    }

    if (view === "by-priority") {
      return NextResponse.json(buildByPriority(tickets));
    }

    if (view === "by-type") {
      return NextResponse.json(buildByType(tickets));
    }

    if (view === "by-technician") {
      return NextResponse.json(buildByTechnician(tickets, userMap));
    }

    if (view === "by-category") {
      return NextResponse.json(buildByCategory(tickets));
    }

    if (view === "trend") {
      const days = Number(searchParams.get("days") || "30");
      return NextResponse.json(buildTrend(tickets, days));
    }

    if (view === "recent") {
      return NextResponse.json(buildRecent(tickets, userMap));
    }

    // "all"
    return NextResponse.json({
      kpis: buildKPIs(tickets),
      byStatus: buildByStatus(tickets),
      byPriority: buildByPriority(tickets),
      byType: buildByType(tickets),
      byTechnician: buildByTechnician(tickets, userMap),
      byCategory: buildByCategory(tickets),
      trend7: buildTrend(tickets, 7),
      trend30: buildTrend(tickets, 30),
      trend90: buildTrend(tickets, 90),
      recent: buildRecent(tickets, userMap),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao buscar chamados";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function buildKPIs(tickets: GLPITicket[]): TicketKPIs {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const openStatuses = [
    TicketStatus.New,
    TicketStatus.Assigned,
    TicketStatus.Planned,
    TicketStatus.Pending,
  ];

  const totalOpen = tickets.filter((t) => openStatuses.includes(t.status)).length;

  const closedThisMonth = tickets.filter(
    (t) =>
      (t.status === TicketStatus.Closed || t.status === TicketStatus.Solved) &&
      t.closedate &&
      new Date(t.closedate) >= startOfMonth
  ).length;

  const slaOverdue = tickets.filter((t) => {
    if (!openStatuses.includes(t.status)) return false;
    if (!t.time_to_resolve) return false;
    return new Date(t.time_to_resolve) < now;
  }).length;

  const resolvedThisMonth = tickets.filter(
    (t) =>
      t.solvedate &&
      new Date(t.solvedate) >= startOfMonth &&
      t.date_creation
  );

  let avgResolutionHours = 0;
  if (resolvedThisMonth.length > 0) {
    const totalHours = resolvedThisMonth.reduce((sum, t) => {
      const created = new Date(t.date_creation).getTime();
      const solved = new Date(t.solvedate!).getTime();
      return sum + (solved - created) / (1000 * 60 * 60);
    }, 0);
    avgResolutionHours = Math.round((totalHours / resolvedThisMonth.length) * 10) / 10;
  }

  return { totalOpen, closedThisMonth, slaOverdue, avgResolutionHours };
}

function buildByStatus(tickets: GLPITicket[]): ChartDataItem[] {
  const counts: Record<number, number> = {};
  tickets.forEach((t) => {
    counts[t.status] = (counts[t.status] || 0) + 1;
  });

  return Object.entries(counts).map(([status, count]) => ({
    name: TicketStatusLabel[Number(status)] || `Status ${status}`,
    value: count,
    color: TicketStatusColor[Number(status)] || "#9CA3AF",
  }));
}

function buildByPriority(tickets: GLPITicket[]): ChartDataItem[] {
  const openStatuses = [
    TicketStatus.New,
    TicketStatus.Assigned,
    TicketStatus.Planned,
    TicketStatus.Pending,
  ];
  const openTickets = tickets.filter((t) => openStatuses.includes(t.status));

  const counts: Record<number, number> = {};
  openTickets.forEach((t) => {
    counts[t.priority] = (counts[t.priority] || 0) + 1;
  });

  return Object.entries(counts)
    .sort(([a], [b]) => Number(b) - Number(a))
    .map(([priority, count]) => ({
      name: TicketPriorityLabel[Number(priority)] || `Prioridade ${priority}`,
      value: count,
      color: TicketPriorityColor[Number(priority)] || "#9CA3AF",
    }));
}

function buildByType(tickets: GLPITicket[]): ChartDataItem[] {
  const counts: Record<number, number> = {};
  tickets.forEach((t) => {
    counts[t.type] = (counts[t.type] || 0) + 1;
  });

  const colors: Record<number, string> = {
    [TicketType.Incident]: "#EF4444",
    [TicketType.Request]: "#3B82F6",
  };

  return Object.entries(counts).map(([type, count]) => ({
    name: TicketTypeLabel[Number(type)] || `Tipo ${type}`,
    value: count,
    color: colors[Number(type)] || "#9CA3AF",
  }));
}

function buildByTechnician(tickets: GLPITicket[], userMap: UserMap): ChartDataItem[] {
  const techCounts: Record<string, number> = {};

  tickets.forEach((t) => {
    const raw = t as Record<string, unknown>;
    const username =
      (raw["_users_id_assign"] as string) ||
      String(raw["users_id_lastupdater"] || "");
    const displayName = resolveUserName(username, userMap);
    if (displayName !== "-") {
      techCounts[displayName] = (techCounts[displayName] || 0) + 1;
    }
  });

  return Object.entries(techCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([name, value]) => ({ name, value }));
}

function buildByCategory(tickets: GLPITicket[]): ChartDataItem[] {
  const catCounts: Record<string, number> = {};

  tickets.forEach((t) => {
    const catName =
      (t as Record<string, unknown>)["itilcategories_id"] as string ||
      "Sem categoria";
    catCounts[catName] = (catCounts[catName] || 0) + 1;
  });

  return Object.entries(catCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([name, value]) => ({ name, value }));
}

function buildTrend(tickets: GLPITicket[], days: number): TrendDataItem[] {
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - days);

  const dateMap: Record<string, { opened: number; closed: number }> = {};

  for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
    const key = d.toISOString().split("T")[0];
    dateMap[key] = { opened: 0, closed: 0 };
  }

  tickets.forEach((t) => {
    const createdDate = t.date_creation?.split(" ")[0];
    if (createdDate && dateMap[createdDate] !== undefined) {
      dateMap[createdDate].opened++;
    }
    const closedDate = t.closedate?.split(" ")[0];
    if (closedDate && dateMap[closedDate] !== undefined) {
      dateMap[closedDate].closed++;
    }
  });

  return Object.entries(dateMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, data]) => ({
      date: new Date(date).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
      }),
      ...data,
    }));
}

function buildRecent(tickets: GLPITicket[], userMap: UserMap) {
  const sorted = [...tickets].sort(
    (a, b) => new Date(b.date_creation).getTime() - new Date(a.date_creation).getTime()
  );

  return sorted
    .slice(0, 25)
    .map((t) => {
      const raw = t as Record<string, unknown>;
      const techUsername =
        (raw["_users_id_assign"] as string) ||
        String(raw["users_id_lastupdater"] || "");
      const recipientUsername = String(raw["users_id_recipient"] || "");

      return {
        id: t.id,
        name: t.name,
        type: t.type,
        typeLabel: TicketTypeLabel[t.type] || String(t.type),
        status: t.status,
        statusLabel: TicketStatusLabel[t.status] || String(t.status),
        priority: t.priority,
        priorityLabel: TicketPriorityLabel[t.priority] || String(t.priority),
        priorityColor: TicketPriorityColor[t.priority] || "#9CA3AF",
        technician: resolveUserName(techUsername, userMap),
        recipientName: resolveUserName(recipientUsername, userMap),
        location: String(raw["locations_id"] || "-"),
        date_creation: t.date_creation,
        sla: t.time_to_resolve
          ? new Date(t.time_to_resolve) < new Date()
            ? "Vencido"
            : "No prazo"
          : "-",
        slaOverdue: t.time_to_resolve
          ? new Date(t.time_to_resolve) < new Date()
          : false,
      };
    });
}
