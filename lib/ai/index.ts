/**
 * AI 模块入口
 *
 * 提供统一的导出接口。
 */

// Types
export type {
  AIProvider,
  AIConfig,
  AIErrorItem,
  AIAnalysisResult,
  AIAssistantState,
  AIAssistantMeta,
} from './types';

// AiConfig
export {
  DEFAULT_AI_CONFIG,
  IS_STATIC_EXPORT,
  AI_BOUNDARY_NOTICE,
  getVisibleAIProviders,
  isAIProviderSelectable,
  isCustomAIProvider,
  getDefaultModelForProvider,
  validateApiEndpoint,
  normalizeAIConfig,
  loadAIConfig,
  saveAIConfig,
  getAIBoundaryNotice,
  getAIAssistantMeta,
} from './AiConfig';

// AiClient
export {
  AiClient,
  aiClient,
  buildAnalysisPrompt,
  buildGenerationPrompt,
  buildFixPrompt,
} from './AiClient';

export type { AICallOptions, AICallResult } from './AiClient';
