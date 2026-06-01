import { NextRequest, NextResponse } from "next/server";
import {
  getEnrichedTickets,
  resolveUserName,
  type UserMap,
} from "@/lib/enrich-tickets";
import type {
  GLPITicket,
  TicketKPIs,
  ChartDataItem,
  TrendDataItem,
  TechStatusLoad,
  TechStatusSegment,
  OldestTicket,
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const view = searchParams.get("view") || "all";
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    const { tickets: allTickets, userMap } = await getEnrichedTickets();

    let tickets = allTickets;
    if (dateFrom || dateTo) {
      tickets = allTickets.filter((t) => {
        const createdDate = t.date_creation?.split(" ")[0];
        if (!createdDate) return false;
        if (dateFrom && createdDate < dateFrom) return false;
        if (dateTo && createdDate > dateTo) return false;
        return true;
      });
    }

    if (view === "kpis") {
      return NextResponse.json(buildKPIs(tickets, userMap));
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

    return NextResponse.json({
      kpis: buildKPIs(tickets, userMap),
      backlogByAge: buildBacklogByAge(tickets),
      byStatus: buildByStatus(tickets),
      byPriority: buildByPriority(tickets),
      byType: buildByType(tickets),
      byTechnician: buildByTechnician(tickets, userMap),
      loadByTechAge: buildLoadByTechAge(tickets, userMap),
      openByCategory: buildOpenByCategory(tickets),
      oldestOpen: buildOldestOpen(tickets, userMap),
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

function buildKPIs(tickets: GLPITicket[], userMap: UserMap): TicketKPIs {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);

  const openTickets = tickets.filter((t) =>
    OPEN_TICKET_STATUSES.includes(t.status),
  );

  const openedToday = tickets.filter(
    (t) => t.date_creation && new Date(t.date_creation) >= startOfToday,
  ).length;

  const closedToday = tickets.filter(
    (t) =>
      (t.status === TicketStatus.Closed || t.status === TicketStatus.Solved) &&
      t.closedate &&
      new Date(t.closedate) >= startOfToday,
  ).length;

  const totalOpen = openTickets.length;

  const closedThisMonth = tickets.filter(
    (t) =>
      (t.status === TicketStatus.Closed || t.status === TicketStatus.Solved) &&
      t.closedate &&
      new Date(t.closedate) >= startOfMonth,
  ).length;

  const slaOverdue = openTickets.filter((t) => {
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

  const unassigned = openTickets.filter(
    (t) =>
      (t._users_id_assign?.length ?? 0) === 0 &&
      (t._groups_id_assign?.length ?? 0) === 0,
  ).length;

  let oldestOpenDays = 0;
  for (const t of openTickets) {
    if (!t.date_creation) continue;
    const created = new Date(t.date_creation).getTime();
    if (Number.isNaN(created)) continue;
    const ageDays = (now.getTime() - created) / 86_400_000;
    if (ageDays > oldestOpenDays) oldestOpenDays = ageDays;
  }
  oldestOpenDays = Math.round(oldestOpenDays);

  const slaCriticalCount = openTickets.filter((t) => {
    if (!t.time_to_resolve) return false;
    const deadline = new Date(t.time_to_resolve);
    return deadline >= now && deadline < twoHoursFromNow;
  }).length;

  const loadMap = new Map<string, number>();
  for (const t of openTickets) {
    const techs = t._users_id_assign ?? [];
    if (techs.length === 0) {
      loadMap.set("Não atribuído", (loadMap.get("Não atribuído") ?? 0) + 1);
      continue;
    }
    for (const techId of techs) {
      const name = resolveUserName(techId, userMap);
      loadMap.set(name, (loadMap.get(name) ?? 0) + 1);
    }
  }
  const currentLoadByTech: ChartDataItem[] = Array.from(loadMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, value]) => ({ name, value }));

  const mttrAcc = new Map<number, { sum: number; count: number }>();
  for (const t of resolvedThisMonth) {
    const created = new Date(t.date_creation).getTime();
    const solved = new Date(t.solvedate!).getTime();
    if (Number.isNaN(created) || Number.isNaN(solved)) continue;
    const hours = (solved - created) / 3_600_000;
    const acc = mttrAcc.get(t.priority) ?? { sum: 0, count: 0 };
    acc.sum += hours;
    acc.count += 1;
    mttrAcc.set(t.priority, acc);
  }
  const mttrByPriority: ChartDataItem[] = Array.from(mttrAcc.entries())
    .sort((a, b) => b[0] - a[0])
    .map(([priority, { sum, count }]) => ({
      name: TicketPriorityLabel[priority] ?? `Prioridade ${priority}`,
      value: Math.round((sum / count) * 10) / 10,
      color: TicketPriorityColor[priority],
    }));

  const slaPctFor = (start: Date, end: Date): number | null => {
    const resolved = tickets.filter((t) => {
      if (!t.solvedate || !t.time_to_resolve) return false;
      const solved = new Date(t.solvedate);
      return solved >= start && solved < end;
    });
    if (resolved.length === 0) return null;
    const onTime = resolved.filter(
      (t) => new Date(t.solvedate!) <= new Date(t.time_to_resolve!),
    ).length;
    return Math.round((onTime / resolved.length) * 100);
  };
  const slaTodayPct = slaPctFor(
    startOfToday,
    new Date(startOfToday.getTime() + 86_400_000),
  );
  const slaYesterdayPct = slaPctFor(startOfYesterday, startOfToday);

  const reopenedThisMonth = openTickets.filter((t) => {
    if (!t.solvedate && !t.closedate) return false;
    const lastResolve = t.solvedate
      ? new Date(t.solvedate)
      : new Date(t.closedate!);
    return lastResolve >= startOfMonth;
  }).length;

  return {
    totalOpen,
    closedThisMonth,
    slaOverdue,
    avgResolutionHours,
    openedToday,
    closedToday,
    unassigned,
    oldestOpenDays,
    slaCriticalCount,
    currentLoadByTech,
    mttrByPriority,
    slaTodayPct,
    slaYesterdayPct,
    reopenedThisMonth,
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
    const techs = t._users_id_assign ?? [];
    if (techs.length === 0) {
      techCounts["Não atribuído"] = (techCounts["Não atribuído"] || 0) + 1;
      return;
    }
    for (const techId of techs) {
      const name = resolveUserName(techId, userMap);
      techCounts[name] = (techCounts[name] || 0) + 1;
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

function buildOpenByCategory(tickets: GLPITicket[]): ChartDataItem[] {
  const open = tickets.filter((t) => OPEN_TICKET_STATUSES.includes(t.status));
  const catCounts: Record<string, number> = {};

  open.forEach((t) => {
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

const AGE_BUCKETS = [
  { label: "Hoje", color: "#10B981" },
  { label: "Esta semana", color: "#F59E0B" },
  { label: "Até 30 dias", color: "#F97316" },
  { label: "+30 dias", color: "#EF4444" },
];

function buildLoadByTechAge(
  tickets: GLPITicket[],
  userMap: UserMap,
): TechStatusLoad[] {
  const openTickets = tickets.filter((t) =>
    OPEN_TICKET_STATUSES.includes(t.status),
  );

  const now = new Date();
  const DAY = 86_400_000;
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  const mondayOffset = (now.getDay() + 6) % 7;
  const startOfWeek = startOfToday - mondayOffset * DAY;
  const thirtyDaysAgo = now.getTime() - 30 * DAY;

  const bucketOf = (createdMs: number): number => {
    if (createdMs >= startOfToday) return 0;
    if (createdMs >= startOfWeek) return 1;
    if (createdMs >= thirtyDaysAgo) return 2;
    return 3;
  };

  const map = new Map<string, Map<number, number>>();
  for (const t of openTickets) {
    if (!t.date_creation) continue;
    const created = new Date(t.date_creation).getTime();
    if (Number.isNaN(created)) continue;
    const bucket = bucketOf(created);
    const techs = t._users_id_assign ?? [];
    const names =
      techs.length === 0
        ? ["Não atribuído"]
        : techs.map((id) => resolveUserName(id, userMap));
    for (const name of names) {
      const byBucket = map.get(name) ?? new Map<number, number>();
      byBucket.set(bucket, (byBucket.get(bucket) ?? 0) + 1);
      map.set(name, byBucket);
    }
  }

  const result: TechStatusLoad[] = Array.from(map.entries()).map(
    ([name, byBucket]) => {
      const segments: TechStatusSegment[] = Array.from(byBucket.entries())
        .map(([bucket, value]) => ({
          status: bucket,
          label: AGE_BUCKETS[bucket].label,
          color: AGE_BUCKETS[bucket].color,
          value,
        }))
        .sort((a, b) => a.status - b.status);
      const total = segments.reduce((sum, seg) => sum + seg.value, 0);
      return { name, total, segments };
    },
  );

  return result.sort((a, b) => b.total - a.total).slice(0, 10);
}

function buildOldestOpen(
  tickets: GLPITicket[],
  userMap: UserMap,
): OldestTicket[] {
  const openTickets = tickets.filter((t) =>
    OPEN_TICKET_STATUSES.includes(t.status),
  );
  const now = Date.now();

  return openTickets
    .filter((t) => t.date_creation)
    .map((t) => {
      const created = new Date(t.date_creation).getTime();
      const ageDays = Number.isNaN(created)
        ? 0
        : Math.floor((now - created) / 86_400_000);
      const techs = t._users_id_assign ?? [];
      const technician =
        techs.length === 0
          ? "Não atribuído"
          : techs
              .map((id) => resolveUserName(id, userMap))
              .filter((n) => n !== "-")
              .join(", ") || "Não atribuído";
      return {
        id: t.id,
        name: t.name,
        technician,
        ageDays,
        date_creation: t.date_creation,
      };
    })
    .sort((a, b) => b.ageDays - a.ageDays)
    .slice(0, 10);
}

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
    const techs = t._users_id_assign ?? [];
    const technician =
      techs.length === 0
        ? "Não atribuído"
        : techs
            .map((id) => resolveUserName(id, userMap))
            .filter((n) => n !== "-")
            .join(", ") || "Não atribuído";
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
      technician,
      recipientName: resolveUserName(recipientUsername, userMap),
      location:
        typeof t.locations_id === "string" &&
        t.locations_id.trim() &&
        t.locations_id !== "0"
          ? t.locations_id
          : "-",
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
