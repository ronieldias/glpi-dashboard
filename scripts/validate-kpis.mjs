// Valida cada KPI do dashboard fazendo a MESMA contagem via search/Ticket
// direto no GLPI, e compara com o valor retornado pela nossa API.
//
// Se nossos números divergirem, o output deixa CLARO qual KPI está errado.
//
// Uso: node scripts/validate-kpis.mjs

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

const TS_NOW = "2026-05-22 19:00:00"; // ISO-like; GLPI aceita
const START_OF_TODAY = `${TS_NOW.slice(0, 10)} 00:00:00`;
const START_OF_MONTH = `${TS_NOW.slice(0, 7)}-01 00:00:00`;

const { session_token: T } = await (
  await fetch(`${B}/apirest.php/initSession`, {
    headers: { "App-Token": A, Authorization: `user_token ${U}` },
  })
).json();

const H = { "App-Token": A, "Session-Token": T };

/**
 * Constrói criteria nos parâmetros de URL no formato que o GLPI search espera.
 * criteria[i][link], [field], [searchtype], [value]
 */
function buildCriteria(criteria) {
  const params = new URLSearchParams();
  criteria.forEach((c, i) => {
    params.append(`criteria[${i}][link]`, c.link ?? (i === 0 ? "AND" : "AND"));
    params.append(`criteria[${i}][field]`, String(c.field));
    params.append(`criteria[${i}][searchtype]`, c.searchtype);
    params.append(`criteria[${i}][value]`, String(c.value));
  });
  params.append("range", "0-0");
  return params;
}

async function searchCount(criteria) {
  const params = buildCriteria(criteria);
  const r = await fetch(`${B}/apirest.php/search/Ticket?${params}`, {
    headers: H,
  });
  if (!r.ok) return null;
  const j = await r.json().catch(() => ({}));
  return typeof j.totalcount === "number" ? j.totalcount : null;
}

// Conta agrupando por uma lista de status com OR
async function countByStatuses(statuses, extraCriteria = []) {
  const criteria = statuses.map((s, i) => ({
    link: i === 0 ? "AND" : "OR",
    field: 12, // status
    searchtype: "equals",
    value: s,
  }));
  // wrap into a group quando há outras condições — GLPI suporta criteria aninhadas
  // mas a forma simples é fazer N requests e somar (cada uma com 1 status + extras)
  if (extraCriteria.length === 0) {
    return searchCount(criteria);
  }
  let total = 0;
  for (const s of statuses) {
    const c = [
      { link: "AND", field: 12, searchtype: "equals", value: s },
      ...extraCriteria,
    ];
    const n = await searchCount(c);
    if (n === null) return null;
    total += n;
  }
  return total;
}

// Pega nossos KPIs do endpoint local
const ourKpis = await (
  await fetch("http://localhost:3010/api/glpi/tickets?view=kpis")
).json();

console.log("================================================");
console.log("VALIDAÇÃO DE KPIs vs GLPI search/Ticket");
console.log("================================================\n");

const checks = [
  {
    name: "totalOpen (status 1|2|3|4)",
    our: ourKpis.totalOpen,
    glpi: await countByStatuses([1, 2, 3, 4]),
  },
  {
    name: "slaOverdue (status 1-4 AND time_to_resolve < now)",
    our: ourKpis.slaOverdue,
    glpi: await countByStatuses(
      [1, 2, 3, 4],
      [
        {
          link: "AND",
          field: 18, // time_to_resolve
          searchtype: "lessthan",
          value: TS_NOW,
        },
      ],
    ),
  },
  {
    name: "closedThisMonth (status 5|6 AND closedate >= startOfMonth)",
    our: ourKpis.closedThisMonth,
    glpi: await countByStatuses(
      [5, 6],
      [
        {
          link: "AND",
          field: 16, // closedate
          searchtype: "morethan",
          value: START_OF_MONTH,
        },
      ],
    ),
  },
  {
    name: "openedToday (date_creation >= startOfToday)",
    our: ourKpis.openedToday,
    glpi: await searchCount([
      {
        link: "AND",
        field: 15, // date_creation
        searchtype: "morethan",
        value: START_OF_TODAY,
      },
    ]),
  },
  {
    name: "closedToday (status 5|6 AND closedate >= startOfToday)",
    our: ourKpis.closedToday,
    glpi: await countByStatuses(
      [5, 6],
      [
        {
          link: "AND",
          field: 16,
          searchtype: "morethan",
          value: START_OF_TODAY,
        },
      ],
    ),
  },
  {
    name: "unassigned (status 1-4 AND users_id_assign = 0)",
    our: ourKpis.unassigned,
    note: "comparação aproximada: GLPI search field 5 = 0 só checa users, não groups. Nosso KPI exige ambos vazios.",
    glpi: await countByStatuses(
      [1, 2, 3, 4],
      [
        {
          link: "AND",
          field: 5, // users_id_assign
          searchtype: "equals",
          value: 0,
        },
      ],
    ),
  },
];

const PAD = 60;
for (const c of checks) {
  const ok = c.our === c.glpi;
  const mark = ok ? "✓" : "✗";
  const ourS = String(c.our).padStart(6);
  const glpiS = String(c.glpi).padStart(6);
  console.log(
    `${mark} ${c.name.padEnd(PAD)} nossa=${ourS}  GLPI=${glpiS}  ${ok ? "" : `Δ=${c.our - c.glpi}`}`,
  );
  if (c.note) console.log(`  ↳ ${c.note}`);
}

await fetch(`${B}/apirest.php/killSession`, { headers: H }).catch(() => {});
