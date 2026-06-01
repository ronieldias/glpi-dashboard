import { glpiFetchAll } from "./glpi-fetch-all";
import { getOrFetch } from "./glpi-cache";
import type {
  GLPITicket,
  GLPITicketUser,
  GLPIGroupTicket,
  GLPIUser,
} from "@/types/glpi";

const TICKETS_TTL_MS = 15_000;
const RELATIONS_TTL_MS = 15_000;
const USERS_TTL_MS = 5 * 60_000;

export type UserMap = Record<string, string>;

export async function getUserMap(): Promise<UserMap> {
  return getOrFetch("users-map", USERS_TTL_MS, async () => {
    const users = await glpiFetchAll<GLPIUser>("/User", { chunkSize: 300 });
    const map: UserMap = {};
    for (const u of users) {
      const fullName = [u.firstname, u.realname]
        .filter(Boolean)
        .join(" ")
        .trim();
      const display = fullName || u.name;
      map[String(u.id)] = display;
      if (u.name) map[u.name] = display;
    }
    return map;
  });
}

export interface EnrichedTicketsData {
  tickets: GLPITicket[];
  userMap: UserMap;
}

export async function getEnrichedTickets(): Promise<EnrichedTicketsData> {
  const [rawTickets, ticketUsers, groupTickets, userMap] = await Promise.all([
    getOrFetch("tickets-raw", TICKETS_TTL_MS, () =>
      glpiFetchAll<GLPITicket>("/Ticket", {
        chunkSize: 200,
        expandDropdowns: true,
      }),
    ),
    getOrFetch("ticket-users", RELATIONS_TTL_MS, () =>
      glpiFetchAll<GLPITicketUser>("/Ticket_User", { chunkSize: 500 }),
    ),
    getOrFetch("group-tickets", RELATIONS_TTL_MS, () =>
      glpiFetchAll<GLPIGroupTicket>("/Group_Ticket", { chunkSize: 500 }),
    ),
    getUserMap(),
  ]);

  const assignByTicket = new Map<number, number[]>();
  const observerByTicket = new Map<number, number[]>();
  const requesterByTicket = new Map<number, number[]>();

  for (const tu of ticketUsers) {
    const tid = Number(tu.tickets_id);
    const uid = Number(tu.users_id);
    if (!Number.isFinite(tid) || !Number.isFinite(uid) || uid <= 0) continue;

    const bucket =
      tu.type === 2
        ? assignByTicket
        : tu.type === 3
          ? observerByTicket
          : tu.type === 1
            ? requesterByTicket
            : null;
    if (!bucket) continue;

    const arr = bucket.get(tid);
    if (arr) arr.push(uid);
    else bucket.set(tid, [uid]);
  }

  const groupsByTicket = new Map<number, number[]>();
  for (const gt of groupTickets) {
    if (gt.type !== 2) continue;
    const tid = Number(gt.tickets_id);
    const gid = Number(gt.groups_id);
    if (!Number.isFinite(tid) || !Number.isFinite(gid) || gid <= 0) continue;
    const arr = groupsByTicket.get(tid);
    if (arr) arr.push(gid);
    else groupsByTicket.set(tid, [gid]);
  }

  const enriched: GLPITicket[] = rawTickets.map((t) => ({
    ...t,
    _users_id_assign: assignByTicket.get(t.id) ?? [],
    _users_id_observer: observerByTicket.get(t.id) ?? [],
    _users_id_requester: requesterByTicket.get(t.id) ?? [],
    _groups_id_assign: groupsByTicket.get(t.id) ?? [],
  }));

  return { tickets: enriched, userMap };
}

export function resolveUserName(
  raw: string | number | unknown,
  userMap: UserMap,
): string {
  const key = String(raw ?? "").trim();
  if (!key || key === "0") return "-";
  return userMap[key] || `Usuário #${key}`;
}
