// Inspeciona Ticket_User (vínculo user-ticket) para confirmar a estratégia
// de enriquecimento dos tickets em memória.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const env = Object.fromEntries(
  fs
    .readFileSync(path.join(__dirname, "..", ".env.local"), "utf-8")
    .split(/\r?\n/)
    .map((l) => l.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/))
    .filter(Boolean)
    .map((m) => [m[1], m[2].trim()]),
);
const { GLPI_BASE_URL: B, GLPI_APP_TOKEN: A, GLPI_USER_TOKEN: U } = env;

const { session_token: T } = await (
  await fetch(`${B}/apirest.php/initSession`, {
    headers: { "App-Token": A, Authorization: `user_token ${U}` },
  })
).json();

// Totalcount de Ticket_User e Group_Ticket
async function totalOf(itemtype) {
  const r = await fetch(`${B}/apirest.php/${itemtype}?range=0-0`, {
    headers: { "App-Token": A, "Session-Token": T },
  });
  const cr = r.headers.get("Content-Range");
  const m = cr?.match(/\/(\d+)$/);
  return m ? Number(m[1]) : "?";
}

console.log(`Ticket_User total:  ${await totalOf("Ticket_User")}`);
console.log(`Group_Ticket total: ${await totalOf("Group_Ticket")}`);

// Pegar 5 amostras
const sample = await (
  await fetch(`${B}/apirest.php/Ticket_User?range=0-4&expand_dropdowns=false`, {
    headers: { "App-Token": A, "Session-Token": T },
  })
).json();

console.log("\nAmostra Ticket_User:");
for (const tu of sample) {
  console.log(`  tickets_id=${tu.tickets_id}  users_id=${tu.users_id}  type=${tu.type}  use_notification=${tu.use_notification}`);
}

// Pegar 1 Group_Ticket
const gt = await (
  await fetch(`${B}/apirest.php/Group_Ticket?range=0-2&expand_dropdowns=false`, {
    headers: { "App-Token": A, "Session-Token": T },
  })
).json();
console.log("\nAmostra Group_Ticket:");
for (const g of gt) {
  console.log(`  tickets_id=${g.tickets_id}  groups_id=${g.groups_id}  type=${g.type}`);
}

// Validar: 3 tickets em aberto com Ticket_User type=2 (assigned)
// type=1 requester, type=2 assigned, type=3 watcher (observador)
const openTickets = await (
  await fetch(
    `${B}/apirest.php/search/Ticket?` +
      `criteria[0][link]=AND&criteria[0][field]=12&criteria[0][searchtype]=equals&criteria[0][value]=1` +
      `&criteria[1][link]=OR&criteria[1][field]=12&criteria[1][searchtype]=equals&criteria[1][value]=2` +
      `&criteria[2][link]=OR&criteria[2][field]=12&criteria[2][searchtype]=equals&criteria[2][value]=3` +
      `&criteria[3][link]=OR&criteria[3][field]=12&criteria[3][searchtype]=equals&criteria[3][value]=4` +
      `&forcedisplay[0]=2&forcedisplay[1]=5&forcedisplay[2]=8&range=0-2`,
    { headers: { "App-Token": A, "Session-Token": T } },
  )
).json();
console.log("\nsearch/Ticket open (com forcedisplay 5=tech, 8=group):");
console.log(JSON.stringify(openTickets.data?.slice(0, 3), null, 2));

await fetch(`${B}/apirest.php/killSession`, {
  headers: { "App-Token": A, "Session-Token": T },
}).catch(() => {});
