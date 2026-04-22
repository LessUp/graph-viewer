/**
 * 统一日志工具
 * 开发环境下输出到控制台，生产环境下静默
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const isDev = process.env.NODE_ENV !== 'production';

function formatMessage(level: LogLevel, context: string, data?: Record<string, unknown>): string {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}] [${context}]`;
  if (data) {
    return `${prefix} ${JSON.stringify(data)}`;
  }
  return prefix;
}

export const logger = {
  debug(context: string, data?: Record<string, unknown>): void {
    if (isDev) {
      console.debug(formatMessage('debug', context, data));
    }
  },

  info(context: string, data?: Record<string, unknown>): void {
    if (isDev) {
      console.info(formatMessage('info', context, data));
    }
  },

  warn(context: string, data?: Record<string, unknown>): void {
    if (isDev) {
      console.warn(formatMessage('warn', context, data));
    }
  },

  error(context: string, data?: Record<string, unknown>): void {
    // 错误日志始终记录，便于生产环境排查问题
    console.error(formatMessage('error', context, data));
  },
};
