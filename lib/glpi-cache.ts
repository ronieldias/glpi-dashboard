interface CacheEntry<T> {
  value: T;
  fetchedAt: number;
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

export async function getOrFetch<T>(
  key: string,
  ttlMs: number,
  fetcher: () => Promise<T>,
): Promise<T> {
  const now = Date.now();
  const entry = cache.get(key) as CacheEntry<T> | undefined;

  if (entry && now - entry.fetchedAt < ttlMs) {
    return entry.value;
  }

  if (entry && now - entry.fetchedAt < ttlMs * STALE_MULTIPLIER) {
    if (!entry.pending) {
      entry.pending = (async () => {
        try {
          const fresh = await fetcher();
          cache.set(key, { value: fresh, fetchedAt: Date.now() });
          return fresh;
        } catch (err) {
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

  if (entry?.pending) {
    return entry.pending;
  }

  const promise = (async () => {
    try {
      const value = await fetcher();
      cache.set(key, { value, fetchedAt: Date.now() });
      return value;
    } catch (err) {
      if (entry) {
        console.warn(`[glpi-cache] fetch failed for ${key}, returning stale:`, err);
        return entry.value;
      }
      throw err;
    }
  })();

  cache.set(key, {
    value: (entry?.value ?? undefined) as T,
    fetchedAt: entry?.fetchedAt ?? 0,
    pending: promise,
  });

  return promise;
}
