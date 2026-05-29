// Inspeciona 3 tickets reais do GLPI da Fadex com expand_dropdowns=true
// para descobrir o formato exato de _users_id_assign, _users_id_observer,
// _category_name, etc.

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

const initRes = await fetch(`${B}/apirest.php/initSession`, {
  headers: { "App-Token": A, Authorization: `user_token ${U}` },
});
const { session_token: T } = await initRes.json();

// Pegar 3 tickets, primeiros 3 com expand_dropdowns
const r = await fetch(`${B}/apirest.php/Ticket?range=0-2&expand_dropdowns=true`, {
  headers: { "App-Token": A, "Session-Token": T },
});
const tickets = await r.json();

for (const t of tickets) {
  console.log("================================================");
  console.log(`Ticket #${t.id}: ${t.name}`);
  console.log(`  status: ${t.status}  priority: ${t.priority}  type: ${t.type}`);
  console.log(`  date_creation: ${t.date_creation}`);
  console.log(`  closedate: ${t.closedate}  solvedate: ${t.solvedate}`);
  console.log(`  time_to_resolve: ${t.time_to_resolve}`);
  console.log("  --- campos que o dashboard usa ---");
  console.log(`  _users_id_assign:        ${JSON.stringify(t._users_id_assign)}`);
  console.log(`  _users_id_recipient:     ${JSON.stringify(t._users_id_recipient)}`);
  console.log(`  _users_id_observer:      ${JSON.stringify(t._users_id_observer)}`);
  console.log(`  users_id_lastupdater:    ${JSON.stringify(t.users_id_lastupdater)}`);
  console.log(`  _users_id_requester:     ${JSON.stringify(t._users_id_requester)}`);
  console.log(`  _category_name:          ${JSON.stringify(t._category_name)}`);
  console.log(`  itilcategories_id:       ${JSON.stringify(t.itilcategories_id)}`);
  console.log(`  _groups_id_assign:       ${JSON.stringify(t._groups_id_assign)}`);
}

// Validar contagem via search com criteria de status
const statusOpen = [1, 2, 3, 4]; // Novo, Em Atendimento, Planejado, Pendente
const params = new URLSearchParams({
  "criteria[0][link]": "AND",
  "criteria[0][field]": "12", // status
  "criteria[0][searchtype]": "equals",
  "criteria[0][value]": String(statusOpen[0]),
  range: "0-0",
});
for (let i = 1; i < statusOpen.length; i++) {
  params.append(`criteria[${i}][link]`, "OR");
  params.append(`criteria[${i}][field]`, "12");
  params.append(`criteria[${i}][searchtype]`, "equals");
  params.append(`criteria[${i}][value]`, String(statusOpen[i]));
}
const cnt = await fetch(`${B}/apirest.php/search/Ticket?${params}`, {
  headers: { "App-Token": A, "Session-Token": T },
});
const cntBody = await cnt.json().catch(() => ({}));
console.log("\n================================================");
console.log(
  `Tickets abertos (status 1|2|3|4) via search/Ticket: totalcount = ${cntBody.totalcount ?? "ERROR"}`,
);

// Tickets sem técnico atribuído (criteria: campo 5 = users_id_assign = 0)
// Field 5 in Ticket search = users_id_assign (técnico atribuído)
const params2 = new URLSearchParams({
  "criteria[0][link]": "AND",
  "criteria[0][field]": "5",
  "criteria[0][searchtype]": "equals",
  "criteria[0][value]": "0",
  range: "0-0",
});
const cnt2 = await fetch(`${B}/apirest.php/search/Ticket?${params2}`, {
  headers: { "App-Token": A, "Session-Token": T },
});
const cnt2Body = await cnt2.json().catch(() => ({}));
console.log(
  `Tickets sem técnico (field 5 = 0): totalcount = ${cnt2Body.totalcount ?? "ERROR"}`,
);

await fetch(`${B}/apirest.php/killSession`, {
  headers: { "App-Token": A, "Session-Token": T },
}).catch(() => {});
