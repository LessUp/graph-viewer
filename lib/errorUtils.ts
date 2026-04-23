/**
 * 错误处理统一工具函数
 */

/**
 * 从未知错误中提取错误消息
 * @param e 捕获的错误
 * @param fallback 默认消息
 * @returns 错误消息字符串
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
 * @param e 捕获的错误
 * @returns 是否为 AbortError
 */
export function isAbortError(e: unknown): boolean {
  return e instanceof Error && e.name === 'AbortError';
}

/**
 * 检查是否为网络错误
 * @param e 捕获的错误
 * @returns 是否为网络错误
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
