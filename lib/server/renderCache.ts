/**
 * 渲染缓存模块
 *
 * 为 Kroki 渲染结果提供缓存和请求去重功能。
 * 使用 TTLCache 实现 TTL 过期和 LRU 淘汰。
 */

import crypto from 'crypto';
import { APP_CONFIG } from '@/lib/config';
import { logger } from '@/lib/logger';
import { TTLCache } from './TTLCache';

// ============================================================================
// Types
// ============================================================================

export type RenderCacheEntry = {
  expires: number;
  contentType: string;
  svg?: string;
  base64?: string;
};

export type RenderTask = Promise<{ buffer: Buffer; cacheEntry: RenderCacheEntry }>;

// ============================================================================
// Cache Instances
// ============================================================================

const cache = new TTLCache<string, RenderCacheEntry>({
  maxEntries: APP_CONFIG.cache.maxEntries,
  defaultTtlMs: APP_CONFIG.cache.ttlMs,
  pruneIntervalMs: APP_CONFIG.cache.pruneIntervalMs,
});

const inflight = new Map<string, RenderTask>();

// ============================================================================
// Cache Key
// ============================================================================

export function keyOfRender(base: string, engine: string, format: string, code: string): string {
  const h = crypto.createHash('sha256').update(code).digest('hex');
  return `${base}|${engine}|${format}|${h}`;
}

// ============================================================================
// Render Cache Operations
// ============================================================================

export function getCachedRender(key: string): RenderCacheEntry | undefined {
  return cache.get(key);
}

export function setCachedRender(key: string, entry: RenderCacheEntry): void {
  cache.set(key, entry);
}

export function pruneRenderCache(now = Date.now()): void {
  cache.prune(now);
}

// ============================================================================
// Inflight Request Deduplication
// ============================================================================

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

// ============================================================================
// Test Utilities
// ============================================================================

export function resetRenderCacheForTests(): void {
  cache.clear();
  inflight.clear();
}
