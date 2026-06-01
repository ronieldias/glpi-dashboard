export enum TicketStatus {
  New = 1,
  Assigned = 2,
  Planned = 3,
  Pending = 4,
  Solved = 5,
  Closed = 6,
}

export const TicketStatusLabel: Record<number, string> = {
  [TicketStatus.New]: "Novo",
  [TicketStatus.Assigned]: "Em atendimento",
  [TicketStatus.Planned]: "Planejado",
  [TicketStatus.Pending]: "Pendente",
  [TicketStatus.Solved]: "Resolvido",
  [TicketStatus.Closed]: "Fechado",
};

export const TicketStatusColor: Record<number, string> = {
  [TicketStatus.New]: "#3B82F6",
  [TicketStatus.Assigned]: "#F59E0B",
  [TicketStatus.Planned]: "#A78BFA",
  [TicketStatus.Pending]: "#F43F5E",
  [TicketStatus.Solved]: "#2DD4BF",
  [TicketStatus.Closed]: "#A1A1AA",
};

export enum TicketPriority {
  VeryLow = 1,
  Low = 2,
  Medium = 3,
  High = 4,
  VeryHigh = 5,
  Major = 6,
}

export const TicketPriorityLabel: Record<number, string> = {
  [TicketPriority.VeryLow]: "Muito baixa",
  [TicketPriority.Low]: "Baixa",
  [TicketPriority.Medium]: "Média",
  [TicketPriority.High]: "Alta",
  [TicketPriority.VeryHigh]: "Muito alta",
  [TicketPriority.Major]: "Crítica",
};

export const TicketPriorityColor: Record<number, string> = {
  [TicketPriority.VeryLow]: "#93C5FD",
  [TicketPriority.Low]: "#60A5FA",
  [TicketPriority.Medium]: "#F59E0B",
  [TicketPriority.High]: "#F97316",
  [TicketPriority.VeryHigh]: "#EF4444",
  [TicketPriority.Major]: "#991B1B",
};

export enum TicketType {
  Incident = 1,
  Request = 2,
}

export const TicketTypeLabel: Record<number, string> = {
  [TicketType.Incident]: "Incidente",
  [TicketType.Request]: "Requisição",
};

export enum ProjectStatus {
  New = 1,
  Processing = 2,
  Closed = 3,
}

export const ProjectStatusLabel: Record<number, string> = {
  1: "Novo",
  2: "Em andamento",
  3: "Fechado",
};

export const ProjectStatusColor: Record<number, string> = {
  1: "#3B82F6",
  2: "#F59E0B",
  3: "#2DD4BF",
};

export interface GLPITicket {
  id: number;
  name: string;
  content: string;
  status: number;
  priority: number;
  type: number;
  date: string;
  date_creation: string;
  date_mod: string;
  solvedate: string | null;
  closedate: string | null;
  time_to_resolve: string | null;
  users_id_recipient: number;
  users_id_lastupdater: number;
  itilcategories_id: number;
  locations_id?: string | number;
  _users_id_assign?: number[];
  _users_id_observer?: number[];
  _users_id_requester?: number[];
  _groups_id_assign?: number[];
  _assigned_user_name?: string;
  _category_name?: string;
  _sla_status?: "on_time" | "late";
}

export interface GLPITicketUser {
  id: number;
  tickets_id: number;
  users_id: number;
  type: 1 | 2 | 3;
  use_notification: number;
}

export interface GLPIGroupTicket {
  id: number;
  tickets_id: number;
  groups_id: number;
  type: 1 | 2 | 3;
}

export interface GLPIProject {
  id: number;
  name: string;
  content: string;
  status: number;
  projectstates_id: number;
  percent_done: number;
  date: string;
  date_mod: string;
  date_creation: string;
  plan_start_date: string | null;
  plan_end_date: string | null;
  real_start_date: string | null;
  real_end_date: string | null;
  users_id: number;
  _manager_name?: string;
  _state_name?: string;
  _tasks_open?: number;
  _tasks_closed?: number;
}

export interface GLPIProjectTask {
  id: number;
  name: string;
  projects_id: number;
  projectstates_id: number;
  percent_done: number;
  plan_start_date: string | null;
  plan_end_date: string | null;
  real_start_date: string | null;
  real_end_date: string | null;
}

export interface GLPIUser {
  id: number;
  name: string;
  realname: string;
  firstname: string;
}

export interface GLPICategory {
  id: number;
  name: string;
  completename: string;
}

export interface GLPISession {
  session_token: string;
}

export interface TicketKPIs {
  totalOpen: number;
  closedThisMonth: number;
  slaOverdue: number;
  avgResolutionHours: number;
  openedToday: number;
  closedToday: number;
  unassigned: number;
  oldestOpenDays: number;
  slaCriticalCount: number;
  currentLoadByTech: ChartDataItem[];
  mttrByPriority: ChartDataItem[];
  slaTodayPct: number | null;
  slaYesterdayPct: number | null;
  reopenedThisMonth: number;
}

export interface ProjectKPIs {
  activeProjects: number;
  completedThisYear: number;
  overdueProjects: number;
  openTasks: number;
}

export interface ChartDataItem {
  name: string;
  value: number;
  color?: string;
}

export interface TechStatusSegment {
  status: number;
  label: string;
  color: string;
  value: number;
}

export interface TechStatusLoad {
  name: string;
  total: number;
  segments: TechStatusSegment[];
}

export interface OldestTicket {
  id: number;
  name: string;
  technician: string;
  ageDays: number;
  date_creation: string;
}

export interface TrendDataItem {
  date: string;
  opened: number;
  closed: number;
}

export interface ProjectTimelineItem {
  id: number;
  name: string;
  start: string;
  end: string;
  percent: number;
}
