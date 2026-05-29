/**
 * Cache in-memory simples com TTL + stale-while-revalidate.
 *
 * Funciona em runtime Node de longa vida (next dev/start) — em ambientes
 * serverless multi-instância cada réplica tem seu próprio Map. Para deploy
 * único na máquina da TV, suficiente.
 *
 * Comportamento:
 * - Se < ttlMs desde a última atualização: serve cache "fresh".
 * - Se entre ttlMs e ttlMs*4: serve cache "stale" E dispara revalidação em background.
 * - Se > ttlMs*4 ou primeira chamada: aguarda fetch síncrono.
 *
 * Evita thundering herd: se duas chamadas chegam ao mesmo tempo com cache expirado,
 * apenas uma dispara o fetcher; a outra recebe o mesmo Promise.
 */

interface CacheEntry<T> {
  value: T;
  fetchedAt: number;
  /** Promise pendente de revalidação (evita disparar fetcher concorrente). */
  pending?: Promise<T>;
}

const cache = new Map<string, CacheEntry<unknown>>();
const STALE_MULTIPLIER = 4;

export interface CacheStats {
  size: number;
  keys: string[];
}

export function getCacheStats(): CacheStats {
  return {
    size: cache.size,
    keys: Array.from(cache.keys()),
  };
}

export function invalidateCache(prefix?: string): number {
  if (!prefix) {
    const size = cache.size;
    cache.clear();
    return size;
  }
  let removed = 0;
  for (const k of cache.keys()) {
    if (k.startsWith(prefix)) {
      cache.delete(k);
      removed++;
    }
  }
  return removed;
}

/**
 * Retorna valor do cache se fresh, ou dispara fetcher conforme estratégia.
 *
 * @param key chave única no cache (inclua params relevantes na string)
 * @param ttlMs idade máxima considerada "fresh"
 * @param fetcher função que produz o valor (chamada com cache miss/stale)
 */
export async function getOrFetch<T>(
  key: string,
  ttlMs: number,
  fetcher: () => Promise<T>,
): Promise<T> {
  const now = Date.now();
  const entry = cache.get(key) as CacheEntry<T> | undefined;

  // Cache fresh
  if (entry && now - entry.fetchedAt < ttlMs) {
    return entry.value;
  }

  // Cache stale (entre ttl e ttl*STALE_MULTIPLIER) → SWR
  if (entry && now - entry.fetchedAt < ttlMs * STALE_MULTIPLIER) {
    // Já há revalidação em andamento? Não dispara outra.
    if (!entry.pending) {
      entry.pending = (async () => {
        try {
          const fresh = await fetcher();
          cache.set(key, { value: fresh, fetchedAt: Date.now() });
          return fresh;
        } catch (err) {
          // Mantém stale no cache em caso de erro
          console.warn(`[glpi-cache] revalidate failed for ${key}:`, err);
          throw err;
        } finally {
          if (cache.has(key)) {
            const e = cache.get(key) as CacheEntry<T>;
            delete e.pending;
          }
        }
      })();
    }
    return entry.value;
  }

  // Cache miss ou muito velho → aguarda fetch síncrono.
  // Se já há fetch em andamento (de outra chamada), reusa o promise.
  if (entry?.pending) {
    return entry.pending;
  }

  const promise = (async () => {
    try {
      const value = await fetcher();
      cache.set(key, { value, fetchedAt: Date.now() });
      return value;
    } catch (err) {
      // Falhou; se há valor antigo, melhor stale do que nada
      if (entry) {
        console.warn(`[glpi-cache] fetch failed for ${key}, returning stale:`, err);
        return entry.value;
      }
      throw err;
    }
  })();

  // Marca pending mesmo sem valor (entry novo)
  cache.set(key, {
    value: (entry?.value ?? undefined) as T,
    fetchedAt: entry?.fetchedAt ?? 0,
    pending: promise,
  });

  return promise;
}
