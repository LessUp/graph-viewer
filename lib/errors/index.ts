/**
 * 错误模块统一入口
 */

export { ApiError, ErrorCode, buildErrorMessage, isApiError, createErrorFromResponse } from './ApiError';
export type { ApiErrorContext } from './ApiError';
