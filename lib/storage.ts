/**
 * localStorage 统一工具函数
 * 消除各 hook 中的重复代码
 */

import { logger } from './logger';

/**
 * 从 localStorage 加载数据
 * @param key 存储键名
 * @param defaultValue 默认值（解析失败或不存在时返回）
 * @returns 解析后的数据或默认值
 */
export function loadFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) {
      return defaultValue;
    }
    return JSON.parse(raw) as T;
  } catch (e: unknown) {
    logger.warn('storage-load', {
      key,
      error: e instanceof Error ? e.message : 'Unknown error',
    });
    return defaultValue;
  }
}

/**
 * 保存数据到 localStorage
 * @param key 存储键名
 * @param value 要保存的数据
 * @returns 是否保存成功
 */
export function saveToStorage<T>(key: string, value: T): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e: unknown) {
    logger.warn('storage-save', {
      key,
      error: e instanceof Error ? e.message : 'Unknown error',
    });
    return false;
  }
}

/**
 * 从 localStorage 删除数据
 * @param key 存储键名
 */
export function removeFromStorage(key: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.removeItem(key);
  } catch (e: unknown) {
    logger.warn('storage-remove', {
      key,
      error: e instanceof Error ? e.message : 'Unknown error',
    });
  }
}

/**
 * 迁移旧版 localStorage 数据到新键名
 * @param legacyKey 旧键名
 * @param newKey 新键名
 * @returns 是否迁移成功
 */
export function migrateStorageKey(legacyKey: string, newKey: string): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  try {
    const legacyData = window.localStorage.getItem(legacyKey);
    if (legacyData === null) {
      return false; // 没有旧数据需要迁移
    }

    // 检查新键名是否已有数据
    const newData = window.localStorage.getItem(newKey);
    if (newData !== null) {
      // 新键名已有数据，删除旧数据
      window.localStorage.removeItem(legacyKey);
      logger.info('storage-migrate', {
        message: 'Legacy key removed, new key exists',
        legacyKey,
        newKey,
      });
      return true;
    }

    // 迁移数据
    window.localStorage.setItem(newKey, legacyData);
    window.localStorage.removeItem(legacyKey);
    logger.info('storage-migrate', {
      message: 'Migrated legacy key to new key',
      legacyKey,
      newKey,
    });
    return true;
  } catch (e: unknown) {
    logger.warn('storage-migrate', {
      legacyKey,
      newKey,
      error: e instanceof Error ? e.message : 'Unknown error',
    });
    return false;
  }
}
