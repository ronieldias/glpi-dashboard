import { TicketStatus, TicketStatusLabel } from "@/types/glpi";
import type { ChartDataItem } from "@/types/glpi";

/**
 * Um chamado só é considerado "concluído" quando está Resolvido ou Fechado.
 * Qualquer outro status (Novo, Em atendimento, Planejado, Pendente — ou um
 * status desconhecido) é tratado como "em aberto", pois ainda demanda ação.
 *
 * O conjunto é derivado de TicketStatusLabel — a MESMA fonte que a API usa
 * em buildByStatus para nomear os itens — então a classificação por nome é
 * consistente por construção, sem strings soltas.
 */
const DONE_STATUS_NAMES = new Set<string>([
  TicketStatusLabel[TicketStatus.Solved],
  TicketStatusLabel[TicketStatus.Closed],
]);

export interface StatusSplit {
  open: ChartDataItem[];
  done: ChartDataItem[];
  openTotal: number;
  doneTotal: number;
  total: number;
}

/**
 * Separa a distribuição de status em dois grupos (abertos × concluídos),
 * cada um ordenado por volume decrescente.
 */
export function splitByOpenClosed(data: ChartDataItem[]): StatusSplit {
  const open: ChartDataItem[] = [];
  const done: ChartDataItem[] = [];

  for (const item of data) {
    if (DONE_STATUS_NAMES.has(item.name)) {
      done.push(item);
    } else {
      open.push(item);
    }
  }

  const byValueDesc = (a: ChartDataItem, b: ChartDataItem) => b.value - a.value;
  open.sort(byValueDesc);
  done.sort(byValueDesc);

  const openTotal = open.reduce((sum, item) => sum + item.value, 0);
  const doneTotal = done.reduce((sum, item) => sum + item.value, 0);

  return { open, done, openTotal, doneTotal, total: openTotal + doneTotal };
}
