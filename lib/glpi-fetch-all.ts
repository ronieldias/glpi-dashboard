import { glpiFetch, glpiFetchRaw } from "./glpi-client";

interface FetchAllOptions {
  /** Tamanho de cada chunk paginado. Default: 200. */
  chunkSize?: number;
  /** Limite máximo de items (safety). Default: 10_000. */
  maxItems?: number;
  /** Se deve adicionar expand_dropdowns=true em cada chunk. Default: false. */
  expandDropdowns?: boolean;
  /** Quantos chunks paralelos executar. Default: 4. */
  concurrency?: number;
  /** Parâmetros adicionais (ex.: filtros, sort). NÃO inclua `range`. */
  extraParams?: Record<string, string>;
}

/**
 * Descobre quantos itens existem no endpoint via Content-Range header.
 *
 * O GLPI retorna `Content-Range: <start>-<end>/<total>` em respostas 206.
 * Para descobrir o total sem baixar dados, pedimos range=0-0 (1 item).
 */
async function fetchTotalCount(
  endpoint: string,
  extraParams: Record<string, string> = {},
): Promise<number> {
  const res = await glpiFetchRaw(endpoint, { ...extraParams, range: "0-0" });
  const cr = res.headers.get("Content-Range");
  if (!cr) {
    // 200 sem Content-Range → leu tudo de uma vez (poucos items)
    const body = (await res.json()) as unknown[];
    return Array.isArray(body) ? body.length : 0;
  }
  const m = cr.match(/\/(\d+)\s*$/);
  if (!m) return 0;
  return Number(m[1]);
}

/**
 * Busca TODOS os itens de um endpoint do GLPI usando paginação real.
 *
 * Estratégia:
 * 1. Primeira request (`range=0-0`) lê o totalcount via header `Content-Range`.
 * 2. Calcula chunks de tamanho `chunkSize`.
 * 3. Dispara chunks em paralelo com concorrência limitada.
 * 4. Concatena resultados na ordem correta.
 *
 * `maxItems` é safety: se o GLPI tiver mais itens, loga um warn e trunca.
 * Default 10_000 cobre a Fadex com folga (hoje: 1246 Ticket_User, 381 Ticket).
 */
export async function glpiFetchAll<T>(
  endpoint: string,
  options: FetchAllOptions = {},
): Promise<T[]> {
  const {
    chunkSize = 200,
    maxItems = 10_000,
    expandDropdowns = false,
    concurrency = 4,
    extraParams = {},
  } = options;

  const total = await fetchTotalCount(endpoint, extraParams);
  if (total === 0) return [];

  const limit = Math.min(total, maxItems);
  if (total > maxItems) {
    console.warn(
      `[glpiFetchAll] ${endpoint}: ${total} items mas maxItems=${maxItems}. Resultado truncado em ${maxItems}.`,
    );
  }

  // Se cabe em um único chunk, evita o overhead de paralelismo
  if (limit <= chunkSize) {
    const params: Record<string, string> = {
      ...extraParams,
      range: `0-${limit - 1}`,
    };
    if (expandDropdowns) params.expand_dropdowns = "true";
    return glpiFetch<T[]>(endpoint, params);
  }

  // Quebra em chunks
  const ranges: Array<[number, number]> = [];
  for (let start = 0; start < limit; start += chunkSize) {
    const end = Math.min(start + chunkSize - 1, limit - 1);
    ranges.push([start, end]);
  }

  // Worker pool — limita concorrência sem dependência externa
  const results: T[][] = new Array(ranges.length);
  let nextIdx = 0;

  async function worker() {
    while (true) {
      const idx = nextIdx++;
      if (idx >= ranges.length) break;
      const [start, end] = ranges[idx];
      const params: Record<string, string> = {
        ...extraParams,
        range: `${start}-${end}`,
      };
      if (expandDropdowns) params.expand_dropdowns = "true";
      results[idx] = await glpiFetch<T[]>(endpoint, params);
    }
  }

  const poolSize = Math.min(concurrency, ranges.length);
  await Promise.all(Array.from({ length: poolSize }, () => worker()));

  return results.flat();
}
