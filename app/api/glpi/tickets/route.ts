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
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    // Buscar chamados e usuarios em paralelo
    const [allTickets, userMap] = await Promise.all([
      glpiFetch<GLPITicket[]>("/Ticket", {
        range: "0-500",
        expand_dropdowns: "true",
      }),
      fetchUserMap(),
    ]);

    // Filtrar por periodo se fornecido
    let tickets = allTickets;
    if (dateFrom || dateTo) {
      tickets = allTickets.filter((t) => {
        // date_creation vem como "2026-03-30 14:22:00" — comparar apenas a parte da data
        const createdDate = t.date_creation?.split(" ")[0];
        if (!createdDate) return false;
        if (dateFrom && createdDate < dateFrom) return false;
        if (dateTo && createdDate > dateTo) return false;
        return true;
      });
    }

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
      return NextResponse.json(buildTrend(allTickets, dateFrom, dateTo));
    }

    if (view === "recent") {
      return NextResponse.json(buildRecent(tickets, userMap));
    }

    // "all"
    return NextResponse.json({
      kpis: buildKPIs(tickets),
      backlogByAge: buildBacklogByAge(tickets),
      byStatus: buildByStatus(tickets),
      byPriority: buildByPriority(tickets),
      byType: buildByType(tickets),
      byTechnician: buildByTechnician(tickets, userMap),
      byCategory: buildByCategory(tickets),
      trend: buildTrend(allTickets, dateFrom, dateTo),
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
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );

  const openStatuses = [
    TicketStatus.New,
    TicketStatus.Assigned,
    TicketStatus.Planned,
    TicketStatus.Pending,
  ];

  const openedToday = tickets.filter(
    (t) => t.date_creation && new Date(t.date_creation) >= startOfToday,
  ).length;

  const closedToday = tickets.filter(
    (t) =>
      (t.status === TicketStatus.Closed || t.status === TicketStatus.Solved) &&
      t.closedate &&
      new Date(t.closedate) >= startOfToday,
  ).length;

  const totalOpen = tickets.filter((t) =>
    openStatuses.includes(t.status),
  ).length;

  const closedThisMonth = tickets.filter(
    (t) =>
      (t.status === TicketStatus.Closed || t.status === TicketStatus.Solved) &&
      t.closedate &&
      new Date(t.closedate) >= startOfMonth,
  ).length;

  const slaOverdue = tickets.filter((t) => {
    if (!openStatuses.includes(t.status)) return false;
    if (!t.time_to_resolve) return false;
    return new Date(t.time_to_resolve) < now;
  }).length;

  const resolvedThisMonth = tickets.filter(
    (t) =>
      t.solvedate && new Date(t.solvedate) >= startOfMonth && t.date_creation,
  );

  let avgResolutionHours = 0;
  if (resolvedThisMonth.length > 0) {
    const totalHours = resolvedThisMonth.reduce((sum, t) => {
      const created = new Date(t.date_creation).getTime();
      const solved = new Date(t.solvedate!).getTime();
      return sum + (solved - created) / (1000 * 60 * 60);
    }, 0);
    avgResolutionHours =
      Math.round((totalHours / resolvedThisMonth.length) * 10) / 10;
  }

  return {
    totalOpen,
    closedThisMonth,
    slaOverdue,
    avgResolutionHours,
    openedToday,
    closedToday,
  };
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

function buildByTechnician(
  tickets: GLPITicket[],
  userMap: UserMap,
): ChartDataItem[] {
  const techCounts: Record<string, number> = {};

  tickets.forEach((t) => {
    const username =
      (t._users_id_assign?.[0] != null ? String(t._users_id_assign[0]) : "") ||
      String(t.users_id_lastupdater || "");
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
    const rawName = (t._category_name || "").trim();
    const rawId = String(t.itilcategories_id ?? "").trim();
    const idIsEmpty = rawId === "" || rawId === "0";
    const catName = rawName || (idIsEmpty ? "Sem categoria" : rawId);
    catCounts[catName] = (catCounts[catName] || 0) + 1;
  });

  return Object.entries(catCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([name, value]) => ({ name, value }));
}

function toLocalDateStr(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildTrend(
  tickets: GLPITicket[],
  dateFrom: string | null,
  dateTo: string | null,
): TrendDataItem[] {
  const now = new Date();
  let startDate: Date;
  let endDate: Date = now;

  if (dateFrom) {
    startDate = new Date(dateFrom + "T00:00:00");
  } else {
    // Sem filtro: ultimos 30 dias
    startDate = new Date(now);
    startDate.setDate(startDate.getDate() - 30);
  }
  if (dateTo) {
    endDate = new Date(dateTo + "T23:59:59");
  }

  const dateMap: Record<string, { opened: number; closed: number }> = {};

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const key = toLocalDateStr(d);
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
      date: new Date(date + "T00:00:00").toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
      }),
      ...data,
    }));
}

const OPEN_TICKET_STATUSES: number[] = [
  TicketStatus.New,
  TicketStatus.Assigned,
  TicketStatus.Planned,
  TicketStatus.Pending,
];

export interface BacklogByAge {
  today: number;
  week: number;
  month: number;
  older: number;
  total: number;
}

function buildBacklogByAge(tickets: GLPITicket[]): BacklogByAge {
  const open = tickets.filter((t) => OPEN_TICKET_STATUSES.includes(t.status));
  const now = Date.now();
  const DAY = 86_400_000;
  const result: BacklogByAge = {
    today: 0,
    week: 0,
    month: 0,
    older: 0,
    total: open.length,
  };

  for (const t of open) {
    if (!t.date_creation) continue;
    const created = new Date(t.date_creation).getTime();
    if (Number.isNaN(created)) continue;
    const ageDays = (now - created) / DAY;

    if (ageDays < 1) result.today++;
    else if (ageDays < 7) result.week++;
    else if (ageDays < 30) result.month++;
    else result.older++;
  }

  return result;
}

const CONTENT_PREVIEW_MAX_CHARS = 280;

function stripHtmlToText(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function buildContentPreview(raw: unknown): string {
  if (typeof raw !== "string" || raw.length === 0) return "";
  const text = stripHtmlToText(raw);
  if (text.length <= CONTENT_PREVIEW_MAX_CHARS) return text;
  return text.slice(0, CONTENT_PREVIEW_MAX_CHARS).trimEnd() + "…";
}

function buildRecent(tickets: GLPITicket[], userMap: UserMap) {
  const open = tickets.filter((t) => OPEN_TICKET_STATUSES.includes(t.status));

  const sorted = [...open].sort(
    (a, b) =>
      new Date(b.date_creation).getTime() - new Date(a.date_creation).getTime(),
  );

  return sorted.slice(0, 25).map((t) => {
    const techUsername =
      (t._users_id_assign?.[0] != null ? String(t._users_id_assign[0]) : "") ||
      String(t.users_id_lastupdater || "");
    const recipientUsername = String(t.users_id_recipient || "");

    return {
      id: t.id,
      name: t.name,
      type: t.type,
      typeLabel: TicketTypeLabel[t.type] || String(t.type),
      status: t.status,
      statusLabel: TicketStatusLabel[t.status] || String(t.status),
      statusColor: TicketStatusColor[t.status] || "#9CA3AF",
      priority: t.priority,
      priorityLabel: TicketPriorityLabel[t.priority] || String(t.priority),
      priorityColor: TicketPriorityColor[t.priority] || "#9CA3AF",
      technician: resolveUserName(techUsername, userMap),
      recipientName: resolveUserName(recipientUsername, userMap),
      location: "-",
      date_creation: t.date_creation,
      contentPreview: buildContentPreview(t.content),
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
