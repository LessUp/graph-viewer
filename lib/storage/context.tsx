/**
 * Storage React Context
 *
 * 提供 StoragePort 的依赖注入机制
 */

'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { StoragePort } from './types';
import { LocalStorageAdapter } from './adapters/LocalStorageAdapter';

const StorageContext = createContext<StoragePort | null>(null);

export type StorageProviderProps = {
  children: ReactNode;
  /** 自定义存储实现（可选，默认使用 LocalStorageAdapter） */
  storage?: StoragePort;
};

/**
 * Storage Provider
 *
 * 默认使用 LocalStorageAdapter，可通过 props 注入自定义实现（如 MockStorageAdapter）
 *
 * @example
 * // 使用默认 localStorage
 * const provider = StorageProvider({ children: <App /> });
 *
 * // 使用 mock 存储（测试）
 * const provider = StorageProvider({ children: <Test />, storage: new MockStorageAdapter() });
 */
export function StorageProvider({ children, storage }: StorageProviderProps) {
  const defaultStorage = useMemo(() => new LocalStorageAdapter(), []);
  const value = storage ?? defaultStorage;

  return (
    <StorageContext.Provider value={value}>
      {children}
    </StorageContext.Provider>
  );
}

/**
 * 获取 StoragePort 实例
 *
 * 必须在 StorageProvider 内使用
 *
 * @example
 * ```typescript
 * function MyComponent() {
 *   const storage = useStorage();
 *   const result = storage.load('my-key', { default: true });
 *   // ...
 * }
 * ```
 */
export function useStorage(): StoragePort {
  const storage = useContext(StorageContext);
  if (!storage) {
    throw new Error('useStorage must be used within StorageProvider');
  }
  return storage;
}

/**
 * 尝试获取 StoragePort 实例（可能为 null）
 *
 * 用于在 Provider 外部使用的场景
 */
export function useStorageOptional(): StoragePort | null {
  return useContext(StorageContext);
}
