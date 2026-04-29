import crypto from 'crypto';
import { APP_CONFIG } from '@/lib/config';
import { logger } from '@/lib/logger';

export type RenderCacheEntry = {
  expires: number;
  contentType: string;
  svg?: string;
  base64?: string;
};

export type RenderTask = Promise<{ buffer: Buffer; cacheEntry: RenderCacheEntry }>;

const cache = new Map<string, RenderCacheEntry>();
const inflight = new Map<string, RenderTask>();
let lastPruneAt = 0;

export function keyOfRender(base: string, engine: string, format: string, code: string): string {
  const h = crypto.createHash('sha256').update(code).digest('hex');
  return `${base}|${engine}|${format}|${h}`;
}

export function getCachedRender(key: string): RenderCacheEntry | undefined {
  return cache.get(key);
}

export function setCachedRender(key: string, entry: RenderCacheEntry): void {
  cache.set(key, entry);
}

export function pruneRenderCache(now = Date.now()): void {
  const { maxEntries, pruneIntervalMs } = APP_CONFIG.cache;
  for (const [key, entry] of cache) {
    if (entry.expires <= now) {
      cache.delete(key);
    }
  }

  if (cache.size <= maxEntries && now - lastPruneAt < pruneIntervalMs) {
    return;
  }

  lastPruneAt = now;

  while (cache.size > maxEntries) {
    const oldestKey = cache.keys().next().value as string | undefined;
    if (!oldestKey) break;
    cache.delete(oldestKey);
  }
}

export function getInflightRender(key: string): RenderTask | undefined {
  return inflight.get(key);
}

export function setInflightRender(key: string, task: RenderTask): void {
  if (inflight.size >= APP_CONFIG.inflight.maxEntries) {
    const oldestKey = inflight.keys().next().value as string | undefined;
    if (oldestKey) {
      inflight.delete(oldestKey);
      logger.debug('inflight-evict', {
        message: 'Evicted oldest inflight entry',
        remaining: inflight.size,
      });
    }
  }
  inflight.set(key, task);
}

export function deleteInflightRender(key: string): void {
  inflight.delete(key);
}

export function resetRenderCacheForTests(): void {
  cache.clear();
  inflight.clear();
  lastPruneAt = 0;
}
