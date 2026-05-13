/**
 * 错误模块统一入口
 */

export {
  ApiError,
  ErrorCode,
  buildErrorMessage,
  isApiError,
  createErrorFromResponse,
} from './ApiError';
export type { ApiErrorContext } from './ApiError';

// ============================================================================
// 错误处理工具函数
// ============================================================================

/**
 * 从未知错误中提取错误消息
 */
export function getErrorMessage(e: unknown, fallback = 'Unknown error'): string {
  if (e instanceof Error) {
    return e.message || fallback;
  }
  if (typeof e === 'string') {
    return e || fallback;
  }
  return fallback;
}

/**
 * 检查是否为 AbortError（请求被取消）
 */
export function isAbortError(e: unknown): boolean {
  return e instanceof Error && e.name === 'AbortError';
}

/**
 * 检查是否为网络错误
 */
export function isNetworkError(e: unknown): boolean {
  if (!(e instanceof Error)) return false;
  const msg = e.message.toLowerCase();
  return (
    msg.includes('network') ||
    msg.includes('fetch') ||
    msg.includes('timeout') ||
    msg.includes('abort')
  );
}
