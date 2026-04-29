/**
 * AI 助手 Hook
 * 接入大模型 API 进行代码分析、自动修正和智能建议
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type { Engine } from '@/lib/diagramConfig';
import { loadFromStorage, saveToStorage } from '@/lib/storage';
import { APP_CONFIG } from '@/lib/config';

export type AIProvider = 'openai' | 'anthropic' | 'local' | 'custom';

export type AIConfig = {
  provider: AIProvider;
  apiKey: string;
  apiEndpoint?: string;
  model?: string;
};

export type AIAnalysisResult = {
  hasErrors: boolean;
  errors: Array<{
    line?: number;
    message: string;
    suggestion?: string;
  }>;
  suggestions: string[];
  correctedCode?: string;
  explanation?: string;
};

export type AIAssistantState = {
  isAnalyzing: boolean;
  isGenerating: boolean;
  lastAnalysis: AIAnalysisResult | null;
  error: string | null;
};

export type AIAssistantMeta = {
  connectionMode: 'browser-direct';
  storesApiKeyInLocalStorage: false;
  staticExportMode: boolean;
};

const DEFAULT_CONFIG: AIConfig = {
  provider: 'openai',
  apiKey: '',
  model: 'gpt-4o-mini',
};

const ANALYSIS_JSON_SCHEMA = `请以 JSON 格式回复，包含以下字段：
- hasErrors: boolean - 是否有错误
- errors: array - 错误列表，每个错误包含 line(行号), message(错误描述), suggestion(修正建议)
- correctedCode: string - 修正后的完整代码（如果有错误）
- suggestions: array - 改进建议列表
- explanation: string - 总体解释`;

const isStaticExport = process.env.NEXT_PUBLIC_STATIC_EXPORT === 'true';

const AI_BOUNDARY_NOTICE = isStaticExport
  ? '当前为静态导出模式。AI 功能会从浏览器直接请求所选供应商 API，API Key 不会写入 localStorage，但会直接发送给对应供应商。'
  : 'AI 功能当前为浏览器直连模式。API Key 不会写入 localStorage，但会从当前浏览器直接发送给所选供应商。';

function buildAnalysisPrompt(engineName: string): string {
  return `你是一个 ${engineName} 图表语法专家。你的任务是：
1. 分析用户提供的 ${engineName} 代码，找出语法错误
2. 提供修正建议和正确的代码
3. 解释错误原因
4. 给出改进建议

${ANALYSIS_JSON_SCHEMA}`;
}

function buildGenerationPrompt(engineName: string): string {
  return `你是一个 ${engineName} 图表生成专家。根据用户的描述，生成对应的 ${engineName} 代码。
只返回纯 ${engineName} 代码，不要包含任何解释或 markdown 代码块标记。`;
}

export function getAIBoundaryNotice() {
  return AI_BOUNDARY_NOTICE;
}

export function getAIAssistantMeta(): AIAssistantMeta {
  return {
    connectionMode: 'browser-direct',
    storesApiKeyInLocalStorage: false,
    staticExportMode: isStaticExport,
  };
}

export function isAIProviderSelectable(provider: AIProvider): boolean {
  return provider !== 'local';
}

export function getVisibleAIProviders(): AIProvider[] {
  return ['openai', 'anthropic', 'custom'];
}

export function isCustomAIProvider(provider: AIProvider): boolean {
  return provider === 'custom';
}

export function getDefaultModelForProvider(provider: AIProvider): string {
  switch (provider) {
    case 'anthropic':
      return 'claude-3-haiku-20240307';
    case 'custom':
      return 'default';
    case 'openai':
    default:
      return 'gpt-4o-mini';
  }
}

export function normalizeAIConfig(config: AIConfig): AIConfig {
  if (!isAIProviderSelectable(config.provider)) {
    return { ...config, provider: 'openai', model: getDefaultModelForProvider('openai') };
  }
  if (config.provider === 'custom') {
    return { ...config, model: config.model || getDefaultModelForProvider('custom') };
  }
  return { ...config, model: config.model || getDefaultModelForProvider(config.provider) };
}

function loadConfig(): AIConfig {
  if (typeof window === 'undefined') return DEFAULT_CONFIG;
  const stored = loadFromStorage<Partial<AIConfig>>(APP_CONFIG.storage.aiConfigKey, {});
  return normalizeAIConfig({ ...DEFAULT_CONFIG, ...stored });
}

function saveConfig(config: AIConfig) {
  if (typeof window === 'undefined') return;
  // API Key 不写入 localStorage
  const { apiKey: _apiKey, ...rest } = config;
  saveToStorage(APP_CONFIG.storage.aiConfigKey, rest);
}

export function useAIAssistant(engine: Engine) {
  const [config, setConfig] = useState<AIConfig>(loadConfig);
  const [state, setState] = useState<AIAssistantState>({
    isAnalyzing: false,
    isGenerating: false,
    lastAnalysis: null,
    error: null,
  });

  const configRef = useRef(config);
  useEffect(() => {
    configRef.current = config;
  }, [config]);

  const updateConfig = useCallback((newConfig: Partial<AIConfig>) => {
    setConfig((prev) => {
      const provider = newConfig.provider ?? prev.provider;
      const updated = normalizeAIConfig({
        ...prev,
        ...newConfig,
        ...(newConfig.provider ? { model: getDefaultModelForProvider(provider) } : {}),
      });
      saveConfig(updated);
      return updated;
    });
  }, []);

  const callAI = useCallback(async (systemPrompt: string, userMessage: string): Promise<string> => {
    const { provider, apiKey, apiEndpoint, model } = configRef.current;

    if (!apiKey) {
      throw new Error('请先配置 AI API Key');
    }

    let endpoint: string;
    let headers: Record<string, string>;
    let body: Record<string, unknown>;

    switch (provider) {
      case 'openai':
        endpoint = apiEndpoint || 'https://api.openai.com/v1/chat/completions';
        if (apiEndpoint && !/^https:\/\//.test(endpoint)) {
          throw new Error('OpenAI 自定义端点必须使用 HTTPS');
        }
        headers = {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        };
        body = {
          model: model || 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
          ],
          temperature: 0.3,
        };
        break;

      case 'anthropic':
        endpoint = apiEndpoint || 'https://api.anthropic.com/v1/messages';
        if (apiEndpoint && !/^https:\/\//.test(endpoint)) {
          throw new Error('Anthropic 自定义端点必须使用 HTTPS');
        }
        headers = {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        };
        body = {
          model: model || 'claude-3-haiku-20240307',
          max_tokens: 4096,
          system: systemPrompt,
          messages: [{ role: 'user', content: userMessage }],
        };
        break;

      case 'custom':
        if (!apiEndpoint) {
          throw new Error('自定义 API 需要配置 endpoint');
        }
        endpoint = apiEndpoint;
        if (!/^https:\/\//.test(endpoint)) {
          throw new Error('自定义 API 端点必须使用 HTTPS');
        }
        headers = {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        };
        body = {
          model: model || 'default',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
          ],
        };
        break;

      default:
        throw new Error(`不支持的 AI 提供商: ${provider}`);
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}) as Record<string, unknown>);
      const errObj = errorData?.error as Record<string, unknown> | undefined;
      const errMsg =
        typeof errObj?.message === 'string' ? errObj.message : `API 请求失败: ${response.status}`;
      throw new Error(errMsg);
    }

    const data = await response.json();
    if (provider === 'anthropic') {
      const content = Array.isArray(data?.content) ? data.content : [];
      return typeof content[0]?.text === 'string' ? content[0].text : '';
    }
    const choices = Array.isArray(data?.choices) ? data.choices : [];
    const msg = choices[0]?.message;
    return typeof msg?.content === 'string' ? msg.content : '';
  }, []);

  const analyzeCode = useCallback(
    async (code: string): Promise<AIAnalysisResult> => {
      setState((prev) => ({ ...prev, isAnalyzing: true, error: null }));

      try {
        const systemPrompt = buildAnalysisPrompt(engine);
        const userMessage = `请分析以下 ${engine} 代码：\n\n${code}`;
        const response = await callAI(systemPrompt, userMessage);

        let result: AIAnalysisResult;
        try {
          const cleanResponse = response
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .trim();
          result = JSON.parse(cleanResponse);
        } catch {
          result = {
            hasErrors: false,
            errors: [],
            suggestions: [response],
            explanation: response,
          };
        }

        setState((prev) => ({
          ...prev,
          isAnalyzing: false,
          lastAnalysis: result,
        }));

        return result;
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : '分析失败';
        setState((prev) => ({
          ...prev,
          isAnalyzing: false,
          error: msg,
        }));
        return {
          hasErrors: true,
          errors: [{ message: msg }],
          suggestions: [],
          explanation: '',
        };
      }
    },
    [engine, callAI],
  );

  const generateCode = useCallback(
    async (description: string): Promise<string | null> => {
      setState((prev) => ({ ...prev, isGenerating: true, error: null }));

      try {
        const systemPrompt = buildGenerationPrompt(engine);
        const response = await callAI(systemPrompt, description);
        const cleanCode = response
          .replace(/```(?:mermaid|plantuml|dot|graphviz|flowchart)?\n?/gi, '')
          .replace(/```\n?/g, '')
          .trim();

        setState((prev) => ({ ...prev, isGenerating: false }));
        return cleanCode;
      } catch (e: unknown) {
        setState((prev) => ({
          ...prev,
          isGenerating: false,
          error: e instanceof Error ? e.message : '生成失败',
        }));
        return null;
      }
    },
    [engine, callAI],
  );

  const fixCode = useCallback(
    async (code: string, errorMessage?: string): Promise<string | null> => {
      if (!code.trim()) {
        setState((prev) => ({ ...prev, error: '请输入代码' }));
        return null;
      }

      setState((prev) => ({ ...prev, isAnalyzing: true, error: null }));

      try {
        const systemPrompt = `你是一个 ${engine} 图表语法专家。请修复以下代码中的错误，只返回修复后的纯代码，不要包含任何解释或 markdown 代码块标记。`;
        const userMessage = errorMessage
          ? `错误信息：${errorMessage}\n\n代码：\n${code}`
          : `请修复以下代码：\n${code}`;

        const response = await callAI(systemPrompt, userMessage);
        const cleanCode = response
          .replace(/```(?:mermaid|plantuml|dot|graphviz|flowchart)?\n?/gi, '')
          .replace(/```\n?/g, '')
          .trim();

        setState((prev) => ({ ...prev, isAnalyzing: false }));
        return cleanCode;
      } catch (e: unknown) {
        setState((prev) => ({
          ...prev,
          isAnalyzing: false,
          error: e instanceof Error ? e.message : '修复失败',
        }));
        return null;
      }
    },
    [engine, callAI],
  );

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const clearAnalysis = useCallback(() => {
    setState((prev) => ({ ...prev, lastAnalysis: null }));
  }, []);

  return {
    config,
    updateConfig,
    state,
    analyzeCode,
    generateCode,
    fixCode,
    clearError,
    clearAnalysis,
    isConfigured: Boolean(config.apiKey),
    boundaryNotice: getAIBoundaryNotice(),
    meta: getAIAssistantMeta(),
  };
}
