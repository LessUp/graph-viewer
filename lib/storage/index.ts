/**
 * localStorage 统一工具函数
 *
 * 向后兼容层：保持现有 API 不变，内部使用 StoragePort
 *
 * @module lib/storage
 */

import { logger } from '../logger';
import type { StoragePort } from './types';
import { LocalStorageAdapter } from './adapters/LocalStorageAdapter';

// 默认存储实例（懒初始化）
let defaultStorage: StoragePort | null = null;

function getDefaultStorage(): StoragePort {
  if (!defaultStorage) {
    defaultStorage = new LocalStorageAdapter();
  }
  return defaultStorage;
}

/**
 * 从 localStorage 加载数据（向后兼容 API）
 *
 * @param key 存储键名
 * @param defaultValue 默认值（解析失败或不存在时返回）
 * @returns 解析后的数据或默认值
 */
export function loadFromStorage<T>(key: string, defaultValue: T): T {
  const result = getDefaultStorage().load(key, defaultValue);
  return result.ok ? result.value : defaultValue;
}

/**
 * 保存数据到 localStorage（向后兼容 API）
 *
 * @param key 存储键名
 * @param value 要保存的数据
 * @returns 是否保存成功（SSR 模式下返回 false）
 */
export function saveToStorage<T>(key: string, value: T): boolean {
  // SSR 环境下返回 false（向后兼容）
  if (typeof window === 'undefined') {
    return false;
  }
  const result = getDefaultStorage().save(key, value);
  if (!result.ok) {
    logger.warn('storage-save-failed', { key, error: result.error.message });
  }
  return result.ok;
}

/**
 * 从 localStorage 删除数据（向后兼容 API）
 *
 * @param key 存储键名
 */
export function removeFromStorage(key: string): void {
  const result = getDefaultStorage().remove(key);
  if (!result.ok) {
    logger.warn('storage-remove-failed', { key, error: result.error.message });
  }
}

/**
 * 迁移旧版 localStorage 数据到新键名（向后兼容 API）
 *
 * @param legacyKey 旧键名
 * @param newKey 新键名
 * @returns 是否迁移成功
 */
export function migrateStorageKey(legacyKey: string, newKey: string): boolean {
  const result = getDefaultStorage().migrate(legacyKey, newKey);
  return result.ok ? result.value : false;
}

// 导出类型和适配器
export type { StoragePort, StorageResult, StorageError, StorageProviderConfig } from './types';
export { LocalStorageAdapter } from './adapters/LocalStorageAdapter';
export { MockStorageAdapter } from './adapters/MockStorageAdapter';
export { StorageProvider, useStorage, useStorageOptional } from './context';
