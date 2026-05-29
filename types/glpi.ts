// Status dos chamados no GLPI
export enum TicketStatus {
  New = 1,
  Assigned = 2, // Em atendimento
  Planned = 3, // Planejado
  Pending = 4, // Pendente
  Solved = 5, // Resolvido
  Closed = 6, // Fechado
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
  // Resolvido em teal (não verde) para não colidir com o destaque esmeralda
  [TicketStatus.Solved]: "#2DD4BF",
  [TicketStatus.Closed]: "#A1A1AA",
};

// Prioridade dos chamados
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

// Tipo de chamado
export enum TicketType {
  Incident = 1,
  Request = 2,
}

export const TicketTypeLabel: Record<number, string> = {
  [TicketType.Incident]: "Incidente",
  [TicketType.Request]: "Requisição",
};

// Status dos projetos
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
  // Fechado em teal para não colidir com o destaque esmeralda
  3: "#2DD4BF",
};

// Interfaces dos recursos
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
  /** Técnicos atribuídos. Populado por enrichTickets a partir de Ticket_User type=2. */
  _users_id_assign?: number[];
  /** Observadores. Populado por enrichTickets a partir de Ticket_User type=3. */
  _users_id_observer?: number[];
  /** Requerentes adicionais. Populado por enrichTickets a partir de Ticket_User type=1. */
  _users_id_requester?: number[];
  /** Grupos atribuídos. Populado por enrichTickets a partir de Group_Ticket type=2. */
  _groups_id_assign?: number[];
  _assigned_user_name?: string;
  _category_name?: string;
  _sla_status?: "on_time" | "late";
}

/** Vínculo relacional User ↔ Ticket. type: 1=requester, 2=assigned (técnico), 3=watcher (observador). */
export interface GLPITicketUser {
  id: number;
  tickets_id: number;
  users_id: number;
  type: 1 | 2 | 3;
  use_notification: number;
}

/** Vínculo relacional Group ↔ Ticket. type: 1=requester, 2=assigned, 3=watcher. */
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
  status: number; // Pode ser variável dependendo da config do GLPI
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

// Tipos para os dados processados dos dashboards
export interface TicketKPIs {
  totalOpen: number;
  closedThisMonth: number;
  slaOverdue: number;
  avgResolutionHours: number;
  openedToday: number;
  closedToday: number;
  /** Tickets em aberto sem técnico atribuído (gatilho de ação). */
  unassigned: number;
  /** Idade em dias do ticket aberto mais antigo. */
  oldestOpenDays: number;
  /** Tickets em aberto cujo time_to_resolve vence em <2h. */
  slaCriticalCount: number;
  /** Carga atual: tickets abertos por técnico responsável (top 10). */
  currentLoadByTech: ChartDataItem[];
  /** MTTR por prioridade (em horas) — apenas tickets resolvidos no mês. */
  mttrByPriority: ChartDataItem[];
  /** % de SLA cumprido hoje (tickets resolvidos com time_to_resolve >= solvedate). */
  slaTodayPct: number | null;
  /** % de SLA cumprido ontem (para delta). */
  slaYesterdayPct: number | null;
  /** Tickets reabertos no mês (status atualmente em aberto, mas com solvedate ou closedate setado anteriormente). */
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

/** Um segmento (status) dentro da barra empilhada de carga por técnico. */
export interface TechStatusSegment {
  status: number;
  label: string;
  color: string;
  value: number;
}

/** Carga em aberto de um técnico, decomposta por status (barra empilhada). */
export interface TechStatusLoad {
  name: string;
  total: number;
  segments: TechStatusSegment[];
}

/** Chamado em aberto mais antigo — para a vista de "chamados antigos". */
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
