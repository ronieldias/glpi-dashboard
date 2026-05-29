// Script ad-hoc para medir o volume real de cada itemtype no GLPI da Fadex.
// Usa o header Content-Range que o GLPI retorna em search/* — formato "0-0/N".
//
// Como funciona:
// 1. Lê .env.local
// 2. initSession (Authorization: user_token + App-Token → session_token)
// 3. Para cada itemtype: GET /search/<type>?range=0-0 e lê Content-Range
//
// Uso: node scripts/check-volume.mjs

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "..", ".env.local");

function loadEnv(file) {
  const text = fs.readFileSync(file, "utf-8");
  const env = {};
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].trim();
  }
  return env;
}

const env = loadEnv(envPath);
const BASE_URL = env.GLPI_BASE_URL;
const APP_TOKEN = env.GLPI_APP_TOKEN;
const USER_TOKEN = env.GLPI_USER_TOKEN;

if (!BASE_URL || !APP_TOKEN || !USER_TOKEN) {
  console.error("Faltam GLPI_BASE_URL / GLPI_APP_TOKEN / GLPI_USER_TOKEN no .env.local");
  process.exit(1);
}

async function initSession() {
  const res = await fetch(`${BASE_URL}/apirest.php/initSession`, {
    headers: {
      "Content-Type": "application/json",
      "App-Token": APP_TOKEN,
      Authorization: `user_token ${USER_TOKEN}`,
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`initSession ${res.status}: ${body.slice(0, 200)}`);
  }
  const data = await res.json();
  return data.session_token;
}

async function killSession(token) {
  await fetch(`${BASE_URL}/apirest.php/killSession`, {
    headers: { "App-Token": APP_TOKEN, "Session-Token": token },
  }).catch(() => {});
}

async function countItemType(token, itemtype, useSearch = true) {
  // /search/<type>?range=0-0 retorna {"totalcount": N, "data": [...]} OU 206 com Content-Range
  // /<type>?range=0-0 retorna array com Content-Range no header
  const url = useSearch
    ? `${BASE_URL}/apirest.php/search/${itemtype}?range=0-0`
    : `${BASE_URL}/apirest.php/${itemtype}?range=0-0`;

  const res = await fetch(url, {
    headers: {
      "App-Token": APP_TOKEN,
      "Session-Token": token,
    },
  });

  const contentRange = res.headers.get("Content-Range");
  let total = null;
  let totalFromBody = null;

  if (contentRange) {
    // formato "0-0/N"
    const m = contentRange.match(/\/(\d+)$/);
    if (m) total = Number(m[1]);
  }

  const body = await res.text();
  try {
    const json = JSON.parse(body);
    if (typeof json.totalcount === "number") totalFromBody = json.totalcount;
  } catch {}

  return {
    itemtype,
    status: res.status,
    contentRange,
    totalFromHeader: total,
    totalFromBody,
    bodyPreview: body.slice(0, 120),
  };
}

(async () => {
  console.log(`GLPI: ${BASE_URL}`);
  const token = await initSession();
  console.log(`Sessão iniciada: ${token.slice(0, 12)}...\n`);

  const types = [
    { name: "Ticket", search: true },
    { name: "Ticket", search: false }, // /Ticket?range=0-0 também (sem search/)
    { name: "User", search: false },
    { name: "Project", search: false },
    { name: "ProjectTask", search: false },
    { name: "Group", search: false },
  ];

  console.log("itemtype                  | status | Content-Range          | totalcount(body) | preview");
  console.log("--------------------------+--------+------------------------+------------------+--------");
  for (const t of types) {
    try {
      const r = await countItemType(token, t.name, t.search);
      const tag = t.search ? `${t.name} (search)` : `${t.name}`;
      console.log(
        `${tag.padEnd(25)} | ${String(r.status).padEnd(6)} | ${(r.contentRange ?? "-").padEnd(22)} | ${String(r.totalFromBody ?? "-").padEnd(16)} | ${r.bodyPreview.replace(/\s+/g, " ").slice(0, 60)}`,
      );
    } catch (err) {
      console.log(`${t.name.padEnd(25)} | ERROR  | ${err.message}`);
    }
  }

  await killSession(token);
  console.log("\nSessão encerrada.");
})().catch((err) => {
  console.error("FATAL:", err);
  process.exit(1);
});
