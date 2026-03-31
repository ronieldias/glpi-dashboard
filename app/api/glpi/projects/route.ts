import { NextRequest, NextResponse } from "next/server";
import { glpiFetch } from "@/lib/glpi-client";
import type {
  GLPIProject,
  GLPIProjectTask,
  ProjectKPIs,
  ChartDataItem,
  ProjectTimelineItem,
} from "@/types/glpi";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const view = searchParams.get("view") || "all";
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    const [allProjects, allTasks] = await Promise.all([
      glpiFetch<GLPIProject[]>("/Project", {
        range: "0-200",
        expand_dropdowns: "true",
      }),
      glpiFetch<GLPIProjectTask[]>("/ProjectTask", {
        range: "0-1000",
        expand_dropdowns: "true",
      }),
    ]);

    // Filtrar por periodo se fornecido
    let projects = allProjects;
    let tasks = allTasks;
    if (dateFrom || dateTo) {
      projects = allProjects.filter((p) => {
        const createdDate = p.date_creation?.split(" ")[0];
        if (!createdDate) return false;
        if (dateFrom && createdDate < dateFrom) return false;
        if (dateTo && createdDate > dateTo) return false;
        return true;
      });
      const projectIds = new Set(projects.map((p) => p.id));
      tasks = allTasks.filter((t) => projectIds.has(t.projects_id));
    }

    if (view === "kpis") {
      return NextResponse.json(buildKPIs(projects, tasks));
    }

    if (view === "by-status") {
      return NextResponse.json(buildByStatus(projects));
    }

    if (view === "progress") {
      return NextResponse.json(buildProgress(projects));
    }

    if (view === "tasks-summary") {
      return NextResponse.json(buildTasksByStatus(tasks));
    }

    if (view === "timeline") {
      return NextResponse.json(buildTimeline(projects));
    }

    if (view === "list") {
      return NextResponse.json(buildList(projects));
    }




    // "all"
    return NextResponse.json({
      kpis: buildKPIs(projects, tasks),
      byStatus: buildByStatus(projects),
      progress: buildProgress(projects),
      tasksSummary: buildTasksByStatus(tasks),
      timeline: buildTimeline(projects),
      list: buildList(projects),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao buscar projetos";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function isActiveStatus(project: GLPIProject): boolean {
  // projectstates_id varia por instalação. Usamos percent_done < 100 e sem real_end_date
  return project.percent_done < 100 && !project.real_end_date;
}

function isCompleted(project: GLPIProject): boolean {
  return project.percent_done >= 100 || !!project.real_end_date;
}

function isOverdue(project: GLPIProject): boolean {
  if (isCompleted(project)) return false;
  if (!project.plan_end_date) return false;
  return new Date(project.plan_end_date) < new Date();
}

function buildKPIs(projects: GLPIProject[], tasks: GLPIProjectTask[]): ProjectKPIs {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const activeProjects = projects.filter(isActiveStatus).length;

  const completedThisYear = projects.filter(
    (p) =>
      isCompleted(p) &&
      p.real_end_date &&
      new Date(p.real_end_date) >= startOfYear
  ).length;

  const overdueProjects = projects.filter(isOverdue).length;

  // Tarefas que nao sao "Finalizado" nem "Cancelado"
  const openTasks = tasks.filter((t) => {
    const state = getTaskState(t);
    return state !== "finalizado" && state !== "cancelado";
  }).length;

  return { activeProjects, completedThisYear, overdueProjects, openTasks };
}

function buildByStatus(projects: GLPIProject[]): ChartDataItem[] {
  const statusMap: Record<string, number> = {};

  projects.forEach((p) => {
    let label: string;
    if (isCompleted(p)) {
      label = "Concluído";
    } else if (isOverdue(p)) {
      label = "Atrasado";
    } else if (isActiveStatus(p)) {
      label = "Em andamento";
    } else {
      label =
        (p as Record<string, unknown>)["projectstates_id"] as string || "Outro";
    }
    statusMap[label] = (statusMap[label] || 0) + 1;
  });

  const colors: Record<string, string> = {
    "Em andamento": "#F59E0B",
    "Concluído": "#10B981",
    "Atrasado": "#EF4444",
    "Outro": "#9CA3AF",
  };

  return Object.entries(statusMap).map(([name, value]) => ({
    name,
    value,
    color: colors[name] || "#6B7280",
  }));
}

function buildProgress(projects: GLPIProject[]): ChartDataItem[] {
  return projects
    .filter(isActiveStatus)
    .sort((a, b) => b.percent_done - a.percent_done)
    .slice(0, 15)
    .map((p) => ({
      name: p.name.length > 30 ? p.name.slice(0, 30) + "..." : p.name,
      value: p.percent_done,
    }));
}

function getTaskState(task: GLPIProjectTask): string {
  // Com expand_dropdowns, projectstates_id vem como string com o nome do status
  const raw = task as Record<string, unknown>;
  const state = String(raw["projectstates_id"] || "").toLowerCase().trim();
  if (state.includes("finalizado")) return "finalizado";
  if (state.includes("andamento")) return "em andamento";
  if (state.includes("cancelado")) return "cancelado";
  if (state.includes("novo")) return "novo";
  // Fallback pelo percent_done
  if (task.percent_done >= 100) return "finalizado";
  if (task.percent_done > 0) return "em andamento";
  return "novo";
}

function buildTasksByStatus(tasks: GLPIProjectTask[]): ChartDataItem[] {
  const statusColors: Record<string, string> = {
    "Novo": "#3B82F6",
    "Em andamento": "#F59E0B",
    "Finalizado": "#10B981",
    "Cancelado": "#EF4444",
  };

  const statusLabels: Record<string, string> = {
    "novo": "Novo",
    "em andamento": "Em andamento",
    "finalizado": "Finalizado",
    "cancelado": "Cancelado",
  };

  const counts: Record<string, number> = {};
  tasks.forEach((t) => {
    const state = getTaskState(t);
    const label = statusLabels[state] || state;
    counts[label] = (counts[label] || 0) + 1;
  });

  return Object.entries(counts).map(([name, value]) => ({
    name,
    value,
    color: statusColors[name] || "#6B7280",
  }));
}

function buildTimeline(projects: GLPIProject[]): ProjectTimelineItem[] {
  return projects
    .filter((p) => p.plan_start_date && p.plan_end_date)
    .sort(
      (a, b) =>
        new Date(a.plan_start_date!).getTime() -
        new Date(b.plan_start_date!).getTime()
    )
    .slice(0, 10)
    .map((p) => ({
      id: p.id,
      name: p.name.length > 30 ? p.name.slice(0, 30) + "..." : p.name,
      start: p.plan_start_date!,
      end: p.plan_end_date!,
      percent: p.percent_done,
    }));
}

function buildList(projects: GLPIProject[]) {
  const now = new Date();

  return projects.map((p) => {
    const daysRemaining = p.plan_end_date
      ? Math.ceil(
          (new Date(p.plan_end_date).getTime() - now.getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : null;

    return {
      id: p.id,
      name: p.name,
      status: isCompleted(p) ? "Concluído" : isOverdue(p) ? "Atrasado" : "Em andamento",
      manager:
        (p as Record<string, unknown>)["users_id"] as string || "-",
      percent_done: p.percent_done,
      plan_end_date: p.plan_end_date,
      daysRemaining,
      isOverdue: isOverdue(p),
    };
  });
}
