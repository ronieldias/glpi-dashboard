import { TicketStatus, TicketStatusLabel } from "@/types/glpi";
import type { ChartDataItem } from "@/types/glpi";

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
