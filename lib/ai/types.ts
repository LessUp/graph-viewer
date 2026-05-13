/**
 * AI 模块类型定义
 *
 * 包含 AI 提供商、配置、分析结果等类型。
 */

// ============================================================================
// AI Provider Types
// ============================================================================

/**
 * AI 提供商类型
 */
export type AIProvider = 'openai' | 'anthropic' | 'local' | 'custom';

/**
 * AI 配置类型
 */
export type AIConfig = {
  provider: AIProvider;
  apiKey: string;
  apiEndpoint?: string;
  model?: string;
};

// ============================================================================
// Analysis Types
// ============================================================================

/**
 * 代码分析错误项
 */
export type AIErrorItem = {
  line?: number;
  message: string;
  suggestion?: string;
};

/**
 * 代码分析结果
 */
export type AIAnalysisResult = {
  hasErrors: boolean;
  errors: AIErrorItem[];
  suggestions: string[];
  correctedCode?: string;
  explanation?: string;
};

// ============================================================================
// State Types
// ============================================================================

/**
 * AI 助手状态
 */
export type AIAssistantState = {
  isAnalyzing: boolean;
  isGenerating: boolean;
  lastAnalysis: AIAnalysisResult | null;
  error: string | null;
};

/**
 * AI 助手元信息
 */
export type AIAssistantMeta = {
  connectionMode: 'browser-direct';
  storesApiKeyInLocalStorage: false;
  staticExportMode: boolean;
};

// ============================================================================
// API Response Types
// ============================================================================

/**
 * OpenAI API 响应
 */
type OpenAIResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

/**
 * Anthropic API 响应
 */
type AnthropicResponse = {
  content?: Array<{
    text?: string;
  }>;
};

/**
 * 解析 OpenAI 响应
 */
export function parseOpenAIResponse(data: unknown): string {
  const resp = data as OpenAIResponse;
  const choices = Array.isArray(resp?.choices) ? resp.choices : [];
  const msg = choices[0]?.message;
  return typeof msg?.content === 'string' ? msg.content : '';
}

/**
 * 解析 Anthropic 响应
 */
export function parseAnthropicResponse(data: unknown): string {
  const resp = data as AnthropicResponse;
  const content = Array.isArray(resp?.content) ? resp.content : [];
  return typeof content[0]?.text === 'string' ? content[0].text : '';
}
