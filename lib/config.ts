/**
 * 应用配置常量集中管理
 */

export const APP_CONFIG = {
  /** localStorage 键名 */
  storage: {
    stateKey: 'graphviewer:state:v1',
    settingsKey: 'graphviewer:settings:v1',
    versionsKey: 'graphviewer:versions:v1',
    aiConfigKey: 'graphviewer:ai-config:v1',
  },

  /** 旧版 localStorage 键名（用于迁移） */
  legacyStorageKeys: {
    settingsKey: 'graphviewer-settings', // 旧版 settings 键名
  },

  /** API 缓存配置 */
  cache: {
    maxEntries: 200,
    ttlMs: 120_000, // 2 分钟
    pruneIntervalMs: 30_000, // 30 秒
  },

  /** 渲染配置 */
  render: {
    maxCodeLength: 100_000, // 100KB
    timeoutMs: 10_000, // 10 秒
  },

  /** 速率限制配置 */
  rateLimit: {
    windowMs: 60_000, // 1 分钟窗口
    maxRequests: 100, // 每分钟最多 100 次请求
  },

  /** inflight 请求去重配置 */
  inflight: {
    maxEntries: 100, // 最多 100 个并发请求
  },

  /** 版本历史配置 */
  versionHistory: {
    maxVersionsPerDiagram: 50,
    autoSaveIntervalMs: 30_000, // 30 秒
  },

  /** 状态持久化配置 */
  state: {
    storageWriteDebounceMs: 250,
  },
} as const;
