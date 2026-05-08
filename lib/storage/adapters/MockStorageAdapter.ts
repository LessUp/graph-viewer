/**
 * Mock 存储适配器
 *
 * 用于测试的内存存储实现，不依赖浏览器 localStorage
 */

import type { StoragePort, StorageResult, StorageProviderConfig } from '../types';

/**
 * Mock 存储适配器
 *
 * 特性:
 * - 完全在内存中操作
 * - 支持模拟配额超限
 * - 支持访问历史记录（用于断言测试）
 * - 支持直接设置/获取原始数据（测试准备）
 *
 * @example
 * ```typescript
 * const storage = new MockStorageAdapter();
 *
 * // 测试准备
 * storage.setRaw('existing-key', JSON.stringify({ foo: 'bar' }));
 *
 * // 正常操作
 * storage.save('test', { count: 42 });
 * const result = storage.load('test', {});
 *
 * // 模拟配额超限
 * storage.setQuotaExceeded(true);
 * const failedResult = storage.save('another', 'data');
 * expect(failedResult.ok).toBe(false);
 *
 * // 检查访问历史
 * const log = storage.getAccessLog();
 * expect(log).toHaveLength(3);
 * ```
 */
export class MockStorageAdapter implements StoragePort {
  private store: Map<string, string> = new Map();
  private keyPrefix: string;
  private simulateQuotaExceeded: boolean = false;
  private accessLog: Array<{ op: string; key: string; timestamp: number }> = [];

  constructor(config: StorageProviderConfig = {}) {
    this.keyPrefix = config.keyPrefix ?? '';
  }

  private getFullKey(key: string): string {
    return this.keyPrefix ? `${this.keyPrefix}:${key}` : key;
  }

  private log(op: string, key: string): void {
    this.accessLog.push({ op, key, timestamp: Date.now() });
  }

  // ========== 测试辅助方法 ==========

  /**
   * 模拟配额超限
   */
  setQuotaExceeded(value: boolean): void {
    this.simulateQuotaExceeded = value;
  }

  /**
   * 获取访问历史
   */
  getAccessLog(): typeof this.accessLog {
    return [...this.accessLog];
  }

  /**
   * 清空访问历史
   */
  clearAccessLog(): void {
    this.accessLog = [];
  }

  /**
   * 直接设置数据（用于测试准备）
   */
  setRaw(key: string, value: string): void {
    this.store.set(this.getFullKey(key), value);
  }

  /**
   * 获取原始数据
   */
  getRaw(key: string): string | undefined {
    return this.store.get(this.getFullKey(key));
  }

  /**
   * 清空所有数据
   */
  clear(): void {
    this.store.clear();
    this.accessLog = [];
  }

  // ========== StoragePort 实现 ==========

  load<T>(key: string, defaultValue: T): StorageResult<T> {
    this.log('load', key);

    const fullKey = this.getFullKey(key);
    const raw = this.store.get(fullKey);

    if (raw === undefined) {
      return { ok: true, value: defaultValue };
    }

    try {
      return { ok: true, value: JSON.parse(raw) as T };
    } catch {
      // JSON 解析失败时返回默认值
      return { ok: true, value: defaultValue };
    }
  }

  save<T>(key: string, value: T): StorageResult<void> {
    this.log('save', key);

    if (this.simulateQuotaExceeded) {
      return {
        ok: false,
        error: { code: 'QUOTA_EXCEEDED', message: 'Simulated quota exceeded' },
      };
    }

    const fullKey = this.getFullKey(key);
    this.store.set(fullKey, JSON.stringify(value));
    return { ok: true, value: undefined };
  }

  remove(key: string): StorageResult<void> {
    this.log('remove', key);

    const fullKey = this.getFullKey(key);
    this.store.delete(fullKey);
    return { ok: true, value: undefined };
  }

  migrate(legacyKey: string, newKey: string): StorageResult<boolean> {
    this.log('migrate', `${legacyKey}->${newKey}`);

    const fullLegacyKey = this.getFullKey(legacyKey);
    const fullNewKey = this.getFullKey(newKey);

    const legacyData = this.store.get(fullLegacyKey);
    if (legacyData === undefined) {
      return { ok: true, value: false };
    }

    if (this.store.has(fullNewKey)) {
      // 新键名已有数据，删除旧数据
      this.store.delete(fullLegacyKey);
      return { ok: true, value: true };
    }

    // 迁移数据
    this.store.set(fullNewKey, legacyData);
    this.store.delete(fullLegacyKey);
    return { ok: true, value: true };
  }

  exists(key: string): boolean {
    return this.store.has(this.getFullKey(key));
  }

  keys(): string[] {
    const allKeys: string[] = [];
    this.store.forEach((_, k) => {
      if (this.keyPrefix) {
        if (k.startsWith(this.keyPrefix + ':')) {
          allKeys.push(k.slice(this.keyPrefix.length + 1));
        }
      } else {
        allKeys.push(k);
      }
    });
    return allKeys;
  }
}
