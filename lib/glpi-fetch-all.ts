import { glpiFetch, glpiFetchRaw } from "./glpi-client";

interface FetchAllOptions {
  chunkSize?: number;
  maxItems?: number;
  expandDropdowns?: boolean;
  concurrency?: number;
  extraParams?: Record<string, string>;
}

async function fetchTotalCount(
  endpoint: string,
  extraParams: Record<string, string> = {},
): Promise<number> {
  const res = await glpiFetchRaw(endpoint, { ...extraParams, range: "0-0" });
  const cr = res.headers.get("Content-Range");
  if (!cr) {
    const body = (await res.json()) as unknown[];
    return Array.isArray(body) ? body.length : 0;
  }
  const m = cr.match(/\/(\d+)\s*$/);
  if (!m) return 0;
  return Number(m[1]);
}

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

  if (limit <= chunkSize) {
    const params: Record<string, string> = {
      ...extraParams,
      range: `0-${limit - 1}`,
    };
    if (expandDropdowns) params.expand_dropdowns = "true";
    return glpiFetch<T[]>(endpoint, params);
  }

  const ranges: Array<[number, number]> = [];
  for (let start = 0; start < limit; start += chunkSize) {
    const end = Math.min(start + chunkSize - 1, limit - 1);
    ranges.push([start, end]);
  }

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
