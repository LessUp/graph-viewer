/**
 * localStorage 统一工具函数
 *
 * 简化版存储模块，直接操作 localStorage，不引入额外抽象。
 *
 * @module lib/storage
 */

import { logger } from './logger';

/**
 * 从 localStorage 加载数据
 *
 * - SSR 安全：window 未定义时返回 defaultValue
 * - 解析失败时返回 defaultValue 并记录日志
 *
 * @param key 存储键名
 * @param defaultValue 默认值（key 不存在或解析失败时返回）
 * @returns 解析后的数据或默认值
 */
export function loadFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;

  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return defaultValue;
    return JSON.parse(raw) as T;
  } catch (e) {
    logger.warn('storage-load-error', { key, error: e instanceof Error ? e.message : 'unknown' });
    return defaultValue;
  }
}

/**
 * 保存数据到 localStorage
 *
 * - SSR 安全：window 未定义时返回 false
 * - 失败时记录日志（包括配额超限）
 *
 * @param key 存储键名
 * @param value 要保存的数据（必须是 JSON 可序列化的）
 * @returns 是否保存成功
 */
export function saveToStorage<T>(key: string, value: T): boolean {
  if (typeof window === 'undefined') return false;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    const isQuotaExceeded =
      e instanceof DOMException &&
      (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED');
    logger.warn(isQuotaExceeded ? 'storage-quota-exceeded' : 'storage-save-error', {
      key,
      error: e instanceof Error ? e.message : 'unknown',
    });
    return false;
  }
}

/**
 * 迁移旧键名到新键名
 *
 * - 如果旧键不存在，返回 false
 * - 如果新键已存在，只删除旧键
 * - 否则迁移数据并删除旧键
 *
 * @param legacyKey 旧键名
 * @param newKey 新键名
 * @returns 是否执行了迁移操作
 */
export function migrateStorageKey(legacyKey: string, newKey: string): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const legacyData = window.localStorage.getItem(legacyKey);
    if (legacyData === null) return false;

    const newData = window.localStorage.getItem(newKey);
    if (newData !== null) {
      // 新键已存在数据，只删除旧键
      window.localStorage.removeItem(legacyKey);
      return true;
    }

    // 迁移数据并删除旧键
    window.localStorage.setItem(newKey, legacyData);
    window.localStorage.removeItem(legacyKey);
    return true;
  } catch (e) {
    logger.warn('storage-migrate-error', {
      legacyKey,
      newKey,
      error: e instanceof Error ? e.message : 'unknown',
    });
    return false;
  }
}
