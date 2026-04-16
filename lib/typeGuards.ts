/**
 * 运行时类型守卫
 * 用于验证从 JSON.parse 或外部输入解析的数据
 */

import type { DiagramDoc } from './types';
import { isEngine, isFormat } from './diagramConfig';

/**
 * 检查对象是否为有效的 DiagramDoc
 */
export function isDiagramDoc(value: unknown): value is DiagramDoc {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;

  return (
    typeof obj.id === 'string' &&
    obj.id.length > 0 &&
    typeof obj.name === 'string' &&
    isEngine(obj.engine) &&
    isFormat(obj.format) &&
    typeof obj.code === 'string' &&
    (typeof obj.updatedAt === 'undefined' || typeof obj.updatedAt === 'string')
  );
}

/**
 * 检查数组是否为有效的 DiagramDoc 数组
 */
export function isDiagramDocArray(value: unknown): value is DiagramDoc[] {
  return Array.isArray(value) && value.every(isDiagramDoc);
}

/**
 * 验证并清理 DiagramDoc 数组，过滤掉无效项
 */
export function sanitizeDiagramDocs(value: unknown): DiagramDoc[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isDiagramDoc);
}

/**
 * 工作区持久化数据类型
 */
export type PersistedWorkspaceData = {
  diagrams: DiagramDoc[];
  currentId?: string;
};

/**
 * 检查对象是否为有效的工作区持久化数据
 */
export function isPersistedWorkspace(value: unknown): value is PersistedWorkspaceData {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;

  if (!Array.isArray(obj.diagrams)) return false;
  if (!isDiagramDocArray(obj.diagrams)) return false;

  if (obj.currentId !== undefined && typeof obj.currentId !== 'string') return false;

  return true;
}

/**
 * 安全解析 JSON 并验证类型
 */
export function safeParseJson<T>(
  json: string,
  guard: (value: unknown) => value is T,
  fallback: T,
): T {
  try {
    const parsed = JSON.parse(json);
    return guard(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}
