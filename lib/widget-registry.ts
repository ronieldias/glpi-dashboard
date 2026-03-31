"use client";

import { Ticket, CheckCircle, Clock, FolderKanban, FolderCheck, CalendarClock, ListTodo, AlertTriangle } from "lucide-react";
import type { WidgetDefinition, WidgetCategory } from "@/types/widget";

// Lazy imports for widget wrapper components
import { KPITicketsOpen } from "@/components/dashboard/widgets/kpi-tickets-open";
import { KPITicketsClosed } from "@/components/dashboard/widgets/kpi-tickets-closed";
import { KPIAvgTime } from "@/components/dashboard/widgets/kpi-avg-time";
import { KPIProjectsActive } from "@/components/dashboard/widgets/kpi-projects-active";
import { KPIProjectsDone } from "@/components/dashboard/widgets/kpi-projects-done";
import { KPIOverdue } from "@/components/dashboard/widgets/kpi-overdue";
import { KPITasksOpen } from "@/components/dashboard/widgets/kpi-tasks-open";
import { KPISLABreach } from "@/components/dashboard/widgets/kpi-sla-breach";
import { WidgetTicketsByStatus } from "@/components/dashboard/widgets/widget-tickets-by-status";
import { WidgetTicketsByPriority } from "@/components/dashboard/widgets/widget-tickets-by-priority";
import { WidgetTicketsTrend } from "@/components/dashboard/widgets/widget-tickets-trend";
import { WidgetTicketsByTechnician } from "@/components/dashboard/widgets/widget-tickets-by-technician";
import { WidgetTicketsByCategory } from "@/components/dashboard/widgets/widget-tickets-by-category";
import { WidgetSLAIndicator } from "@/components/dashboard/widgets/widget-sla-indicator";
import { WidgetRecentTickets } from "@/components/dashboard/widgets/widget-recent-tickets";
import { WidgetProjectsByStatus } from "@/components/dashboard/widgets/widget-projects-by-status";
import { WidgetProjectProgress } from "@/components/dashboard/widgets/widget-project-progress";
import { WidgetProjectTasksSummary } from "@/components/dashboard/widgets/widget-project-tasks-summary";
import { WidgetProjectTimeline } from "@/components/dashboard/widgets/widget-project-timeline";
import { WidgetProjectsTable } from "@/components/dashboard/widgets/widget-projects-table";

export const widgetCatalog: WidgetDefinition[] = [
  // Overview KPIs
  { id: "kpi-tickets-open", title: "Chamados Abertos", category: "overview", defaultW: 1, defaultH: 1, minW: 1, minH: 1, maxW: 12, maxH: 8, component: KPITicketsOpen },
  { id: "kpi-tickets-closed", title: "Fechados no Mês", category: "overview", defaultW: 1, defaultH: 1, minW: 1, minH: 1, maxW: 12, maxH: 8, component: KPITicketsClosed },
  { id: "kpi-avg-time", title: "Tempo Médio", category: "overview", defaultW: 1, defaultH: 1, minW: 1, minH: 1, maxW: 12, maxH: 8, component: KPIAvgTime },
  { id: "kpi-projects-active", title: "Projetos Ativos", category: "overview", defaultW: 1, defaultH: 1, minW: 1, minH: 1, maxW: 12, maxH: 8, component: KPIProjectsActive },
  { id: "kpi-projects-done", title: "Concluídos no Ano", category: "overview", defaultW: 1, defaultH: 1, minW: 1, minH: 1, maxW: 12, maxH: 8, component: KPIProjectsDone },
  { id: "kpi-overdue", title: "Prazo Vencido", category: "overview", defaultW: 1, defaultH: 1, minW: 1, minH: 1, maxW: 12, maxH: 8, component: KPIOverdue },
  { id: "kpi-tasks-open", title: "Tarefas Abertas", category: "overview", defaultW: 1, defaultH: 1, minW: 1, minH: 1, maxW: 12, maxH: 8, component: KPITasksOpen },

  // Tickets KPIs
  { id: "kpi-sla-breach", title: "SLA Vencido", category: "tickets", defaultW: 1, defaultH: 1, minW: 1, minH: 1, maxW: 12, maxH: 8, component: KPISLABreach },

  // Tickets charts
  { id: "tickets-by-status", title: "Chamados por Status", category: "tickets", defaultW: 3, defaultH: 3, minW: 2, minH: 2, maxW: 12, maxH: 8, component: WidgetTicketsByStatus },
  { id: "tickets-by-priority", title: "Chamados por Prioridade", category: "tickets", defaultW: 3, defaultH: 3, minW: 2, minH: 2, maxW: 12, maxH: 8, component: WidgetTicketsByPriority },
  { id: "tickets-trend", title: "Volume por Período", category: "tickets", defaultW: 4, defaultH: 2, minW: 3, minH: 2, maxW: 12, maxH: 8, component: WidgetTicketsTrend },
  { id: "tickets-by-technician", title: "Ranking Técnicos", category: "tickets", defaultW: 3, defaultH: 3, minW: 2, minH: 2, maxW: 12, maxH: 8, component: WidgetTicketsByTechnician },
  { id: "tickets-by-category", title: "Top 10 Categorias", category: "tickets", defaultW: 3, defaultH: 3, minW: 2, minH: 2, maxW: 12, maxH: 8, component: WidgetTicketsByCategory },
  { id: "tickets-sla", title: "Incidentes vs Requisições", category: "tickets", defaultW: 3, defaultH: 3, minW: 2, minH: 2, maxW: 12, maxH: 8, component: WidgetSLAIndicator },
  { id: "tickets-recent", title: "Chamados Recentes", category: "tickets", defaultW: 2, defaultH: 4, minW: 2, minH: 3, maxW: 12, maxH: 8, component: WidgetRecentTickets },

  // Projects charts
  { id: "projects-by-status", title: "Status Projetos", category: "projects", defaultW: 3, defaultH: 3, minW: 2, minH: 2, maxW: 12, maxH: 8, component: WidgetProjectsByStatus },
  { id: "projects-progress", title: "Progresso por Projeto", category: "projects", defaultW: 4, defaultH: 3, minW: 3, minH: 2, maxW: 12, maxH: 8, component: WidgetProjectProgress },
  { id: "projects-tasks-summary", title: "Tarefas por Status", category: "projects", defaultW: 3, defaultH: 3, minW: 2, minH: 2, maxW: 12, maxH: 8, component: WidgetProjectTasksSummary },
  { id: "projects-timeline", title: "Timeline dos Projetos", category: "projects", defaultW: 6, defaultH: 3, minW: 4, minH: 2, maxW: 12, maxH: 8, component: WidgetProjectTimeline },
  { id: "projects-table", title: "Lista de Projetos", category: "projects", defaultW: 8, defaultH: 2, minW: 4, minH: 2, maxW: 12, maxH: 8, component: WidgetProjectsTable },
];

export const widgetMap = new Map<string, WidgetDefinition>(
  widgetCatalog.map((w) => [w.id, w])
);

export function getWidgetById(id: string): WidgetDefinition | undefined {
  return widgetMap.get(id);
}

export function getWidgetsByCategory(category: WidgetCategory): WidgetDefinition[] {
  return widgetCatalog.filter((w) => w.category === category);
}

export function getWidgetsForPage(page: string): WidgetDefinition[] {
  const categories = PAGE_ALLOWED_CATEGORIES[page];
  if (!categories) return [];
  return widgetCatalog.filter((w) => categories.includes(w.category));
}

// Re-export for convenience
import { PAGE_ALLOWED_CATEGORIES } from "@/types/widget";

// Icon map for KPIs (used in registry display)
export const KPI_ICONS: Record<string, typeof Ticket> = {
  "kpi-tickets-open": Ticket,
  "kpi-tickets-closed": CheckCircle,
  "kpi-avg-time": Clock,
  "kpi-projects-active": FolderKanban,
  "kpi-projects-done": FolderCheck,
  "kpi-overdue": CalendarClock,
  "kpi-tasks-open": ListTodo,
  "kpi-sla-breach": AlertTriangle,
};
