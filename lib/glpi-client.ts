import type { GLPISession } from "@/types/glpi";

const GLPI_BASE_URL = process.env.GLPI_BASE_URL || "";
const GLPI_APP_TOKEN = process.env.GLPI_APP_TOKEN || "";
const GLPI_USER_TOKEN = process.env.GLPI_USER_TOKEN || "";

let sessionToken: string | null = null;

async function initSession(): Promise<string> {
  const res = await fetch(`${GLPI_BASE_URL}/apirest.php/initSession`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "App-Token": GLPI_APP_TOKEN,
      Authorization: `user_token ${GLPI_USER_TOKEN}`,
    },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Falha ao iniciar sessão GLPI: ${res.status} - ${error}`);
  }

  const data: GLPISession = await res.json();
  sessionToken = data.session_token;
  return sessionToken;
}

async function ensureSession(): Promise<string> {
  if (!sessionToken) {
    return initSession();
  }
  return sessionToken;
}

export async function glpiFetch<T>(
  endpoint: string,
  params?: Record<string, string>
): Promise<T> {
  const token = await ensureSession();

  const url = new URL(`${GLPI_BASE_URL}/apirest.php${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }

  let res = await fetch(url.toString(), {
    headers: {
      "Content-Type": "application/json",
      "App-Token": GLPI_APP_TOKEN,
      "Session-Token": token,
    },
  });

  // Se sessão expirada, renovar e tentar novamente
  if (res.status === 401) {
    sessionToken = null;
    const newToken = await initSession();
    res = await fetch(url.toString(), {
      headers: {
        "Content-Type": "application/json",
        "App-Token": GLPI_APP_TOKEN,
        "Session-Token": newToken,
      },
    });
  }

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Erro na API GLPI: ${res.status} - ${error}`);
  }

  return res.json();
}

export async function glpiSearch<T>(
  itemType: string,
  criteria: Record<string, string>
): Promise<T> {
  const token = await ensureSession();

  const url = new URL(`${GLPI_BASE_URL}/apirest.php/search/${itemType}`);
  Object.entries(criteria).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  let res = await fetch(url.toString(), {
    headers: {
      "Content-Type": "application/json",
      "App-Token": GLPI_APP_TOKEN,
      "Session-Token": token,
    },
  });

  if (res.status === 401) {
    sessionToken = null;
    const newToken = await initSession();
    res = await fetch(url.toString(), {
      headers: {
        "Content-Type": "application/json",
        "App-Token": GLPI_APP_TOKEN,
        "Session-Token": newToken,
      },
    });
  }

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Erro na busca GLPI: ${res.status} - ${error}`);
  }

  return res.json();
}

export async function killSession(): Promise<void> {
  if (!sessionToken) return;

  try {
    await fetch(`${GLPI_BASE_URL}/apirest.php/killSession`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "App-Token": GLPI_APP_TOKEN,
        "Session-Token": sessionToken,
      },
    });
  } finally {
    sessionToken = null;
  }
}
