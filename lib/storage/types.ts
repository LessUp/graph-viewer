/**
 * 存储模块类型定义
 *
 * 定义 StoragePort 接口和相关类型，用于解耦存储操作
 */

/**
 * 存储操作结果
 * 使用 discriminated union 模式，便于类型收窄
 */
export type StorageResult<T> = { ok: true; value: T } | { ok: false; error: StorageError };

/**
 * 存储错误类型
 */
export type StorageError = {
  code: 'QUOTA_EXCEEDED' | 'PARSE_ERROR' | 'NOT_FOUND' | 'ACCESS_DENIED' | 'UNKNOWN';
  message: string;
};

/**
 * 存储端口接口
 *
 * 不变量:
 * - load() 返回 defaultValue 当 key 不存在或解析失败
 * - save() 返回 { ok: false, error } 当存储配额超限
 * - 所有方法在 SSR 环境下安全返回
 *
 * @example
 * ```typescript
 * const storage = new LocalStorageAdapter();
 * const result = storage.load<{ name: string }>('user', { name: '' });
 * if (result.ok) {
 *   console.log(result.value.name);
 * }
 * ```
 */
export interface StoragePort {
  /**
   * 加载数据
   * @param key 存储键名
   * @param defaultValue 默认值（key 不存在或解析失败时返回）
   */
  load<T>(key: string, defaultValue: T): StorageResult<T>;

  /**
   * 保存数据
   * @param key 存储键名
   * @param value 要保存的数据（必须是 JSON 可序列化的）
   */
  save<T>(key: string, value: T): StorageResult<void>;

  /**
   * 删除数据
   */
  remove(key: string): StorageResult<void>;

  /**
   * 迁移旧键名到新键名
   * @returns 返回 { ok: true, value: true } 表示迁移成功
   * @returns 返回 { ok: true, value: false } 表示无需迁移
   */
  migrate(legacyKey: string, newKey: string): StorageResult<boolean>;

  /**
   * 检查键是否存在
   */
  exists(key: string): boolean;

  /**
   * 获取所有键（可选，用于调试）
   */
  keys?(): string[];
}

/**
 * 存储 Provider 配置
 */
export type StorageProviderConfig = {
  /** 键名前缀，用于命名空间隔离 */
  keyPrefix?: string;
  /** 是否启用日志 */
  enableLogging?: boolean;
};
