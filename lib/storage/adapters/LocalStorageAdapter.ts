/**
 * LocalStorage 适配器
 *
 * 实现 StoragePort 接口，使用浏览器 localStorage 作为存储后端
 */

import { logger } from '@/lib/logger';
import type { StoragePort, StorageResult, StorageError, StorageProviderConfig } from '../types';

/**
 * LocalStorage 适配器实现
 *
 * 特性:
 * - 自动处理 SSR 环境（window 未定义时安全返回）
 * - 支持 JSON 序列化/反序列化
 * - 支持键名前缀（命名空间隔离）
 * - 配额超限检测
 */
export class LocalStorageAdapter implements StoragePort {
  private readonly keyPrefix: string;
  private readonly enableLogging: boolean;

  constructor(config: StorageProviderConfig = {}) {
    this.keyPrefix = config.keyPrefix ?? '';
    this.enableLogging = config.enableLogging ?? false;
  }

  private getFullKey(key: string): string {
    return this.keyPrefix ? `${this.keyPrefix}:${key}` : key;
  }

  private createError(code: StorageError['code'], message: string): StorageError {
    return { code, message };
  }

  private log(operation: string, key: string, details?: Record<string, unknown>): void {
    if (this.enableLogging) {
      logger.info(`storage:${operation}`, { key, ...details });
    }
  }

  load<T>(key: string, defaultValue: T): StorageResult<T> {
    // SSR 环境安全处理
    if (typeof window === 'undefined') {
      return { ok: true, value: defaultValue };
    }

    const fullKey = this.getFullKey(key);

    try {
      const raw = window.localStorage.getItem(fullKey);

      if (raw === null) {
        this.log('load-miss', key);
        return { ok: true, value: defaultValue };
      }

      const parsed = JSON.parse(raw) as T;
      this.log('load-hit', key);
      return { ok: true, value: parsed };
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Unknown error';
      logger.warn('storage-load-error', { key, error: message });
      // 解析失败时返回默认值，不抛出错误
      return { ok: true, value: defaultValue };
    }
  }

  save<T>(key: string, value: T): StorageResult<void> {
    // SSR 环境安全处理
    if (typeof window === 'undefined') {
      return { ok: true, value: undefined };
    }

    const fullKey = this.getFullKey(key);

    try {
      window.localStorage.setItem(fullKey, JSON.stringify(value));
      this.log('save', key);
      return { ok: true, value: undefined };
    } catch (e: unknown) {
      // 检测配额超限
      const isQuotaExceeded =
        e instanceof DOMException &&
        (e.name === 'QuotaExceededError' ||
          e.name === 'NS_ERROR_DOM_QUOTA_REACHED');

      const error = isQuotaExceeded
        ? this.createError('QUOTA_EXCEEDED', '存储空间已满')
        : this.createError('UNKNOWN', e instanceof Error ? e.message : '保存失败');

      logger.warn('storage-save-error', { key, error: error.message });
      return { ok: false, error };
    }
  }

  remove(key: string): StorageResult<void> {
    // SSR 环境安全处理
    if (typeof window === 'undefined') {
      return { ok: true, value: undefined };
    }

    const fullKey = this.getFullKey(key);

    try {
      window.localStorage.removeItem(fullKey);
      this.log('remove', key);
      return { ok: true, value: undefined };
    } catch (e: unknown) {
      const error = this.createError('UNKNOWN', e instanceof Error ? e.message : '删除失败');
      logger.warn('storage-remove-error', { key, error: error.message });
      return { ok: false, error };
    }
  }

  migrate(legacyKey: string, newKey: string): StorageResult<boolean> {
    // SSR 环境安全处理
    if (typeof window === 'undefined') {
      return { ok: true, value: false };
    }

    const fullLegacyKey = this.getFullKey(legacyKey);
    const fullNewKey = this.getFullKey(newKey);

    try {
      const legacyData = window.localStorage.getItem(fullLegacyKey);

      // 没有旧数据需要迁移
      if (legacyData === null) {
        return { ok: true, value: false };
      }

      // 检查新键名是否已有数据
      const newData = window.localStorage.getItem(fullNewKey);
      if (newData !== null) {
        // 新键名已有数据，删除旧数据
        window.localStorage.removeItem(fullLegacyKey);
        this.log('migrate', legacyKey, { action: 'removed-legacy' });
        return { ok: true, value: true };
      }

      // 迁移数据
      window.localStorage.setItem(fullNewKey, legacyData);
      window.localStorage.removeItem(fullLegacyKey);
      this.log('migrate', legacyKey, { action: 'migrated', newKey });
      return { ok: true, value: true };
    } catch (e: unknown) {
      const error = this.createError('UNKNOWN', e instanceof Error ? e.message : '迁移失败');
      logger.warn('storage-migrate-error', { legacyKey, newKey, error: error.message });
      return { ok: false, error };
    }
  }

  exists(key: string): boolean {
    if (typeof window === 'undefined') return false;
    const fullKey = this.getFullKey(key);
    return window.localStorage.getItem(fullKey) !== null;
  }

  keys(): string[] {
    if (typeof window === 'undefined') return [];

    const allKeys: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && (!this.keyPrefix || k.startsWith(this.keyPrefix + ':'))) {
        allKeys.push(
          this.keyPrefix ? k.slice(this.keyPrefix.length + 1) : k
        );
      }
    }
    return allKeys;
  }
}
