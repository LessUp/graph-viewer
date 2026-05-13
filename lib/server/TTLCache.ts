/**
 * TTL 缓存模块
 *
 * 提供带过期时间和 LRU 淘汰策略的内存缓存。
 * 支持类型安全的键值存储和自动清理。
 *
 * 注意：此缓存假设值本身包含 expires 字段，
 * 以便与现有的 RenderCacheEntry 兼容。
 */

/**
 * 带过期时间的值
 */
export type Expirable<T> = T & { expires: number };

/**
 * TTL 缓存配置
 */
export type TTLCacheConfig = {
  /** 最大条目数，超过时淘汰最旧的条目 */
  maxEntries: number;
  /** 默认 TTL（毫秒） */
  defaultTtlMs: number;
  /** 清理间隔（毫秒），用于定期清理过期条目 */
  pruneIntervalMs?: number;
};

/**
 * TTL 缓存 - 带过期时间和 LRU 淘汰的内存缓存
 *
 * 此缓存存储的值本身必须包含 expires 字段。
 *
 * @example
 * ```ts
 * const cache = new TTLCache<string, RenderResult>({
 *   maxEntries: 200,
 *   defaultTtlMs: 120_000,
 * });
 *
 * cache.set('key1', { ...result, expires: Date.now() + 60000 });
 * const cached = cache.get('key1');  // 返回 result 或 undefined
 * cache.prune();                     // 清理所有过期条目
 * ```
 */
export class TTLCache<K, V extends Expirable<unknown>> {
  private readonly cache = new Map<K, V>();
  private lastPruneAt = 0;

  constructor(private readonly config: TTLCacheConfig) {}

  /**
   * 获取缓存值（不检查过期时间）
   *
   * 过期检查由 prune() 和调用者负责。
   * 这与原始 renderCache 的行为一致：getCachedRender 不检查过期，
   * 只有 route.ts 中的调用者检查 cached.expires > now。
   */
  get(key: K): V | undefined {
    return this.cache.get(key);
  }

  /**
   * 设置缓存值（值必须包含 expires 字段）
   */
  set(key: K, value: V): void {
    this.cache.set(key, value);
    this.evictIfNeeded();
  }

  /**
   * 删除缓存条目
   */
  delete(key: K): boolean {
    return this.cache.delete(key);
  }

  /**
   * 检查缓存是否存在（不检查过期时间）
   */
  has(key: K): boolean {
    return this.cache.has(key);
  }

  /**
   * 获取当前缓存大小
   */
  get size(): number {
    return this.cache.size;
  }

  /**
   * 清理所有过期条目
   * 如果超过 maxEntries，同时淘汰最旧的条目
   */
  prune(now = Date.now()): void {
    // 清理过期条目
    for (const [key, entry] of this.cache) {
      if (entry.expires <= now) {
        this.cache.delete(key);
      }
    }

    // 检查是否需要淘汰
    if (this.cache.size <= this.config.maxEntries) {
      // 检查清理间隔
      if (this.config.pruneIntervalMs && now - this.lastPruneAt < this.config.pruneIntervalMs) {
        return;
      }
    }

    this.lastPruneAt = now;

    // LRU 淘汰：删除最旧的条目（Map 保持插入顺序）
    while (this.cache.size > this.config.maxEntries) {
      const oldestKey = this.cache.keys().next().value as K | undefined;
      if (!oldestKey) break;
      this.cache.delete(oldestKey);
    }
  }

  /**
   * 清空所有缓存（用于测试）
   */
  clear(): void {
    this.cache.clear();
    this.lastPruneAt = 0;
  }

  /**
   * 如果超过最大条目数，淘汰最旧的条目
   */
  private evictIfNeeded(): void {
    while (this.cache.size > this.config.maxEntries) {
      const oldestKey = this.cache.keys().next().value as K | undefined;
      if (!oldestKey) break;
      this.cache.delete(oldestKey);
    }
  }
}
