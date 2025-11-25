/**
 * AI 助手 Hook
 * 接入大模型 API 进行代码分析、自动修正和智能建议
 */

import { useState, useCallback } from 'react';
import type { Engine } from '@/lib/diagramConfig';

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

const DEFAULT_CONFIG: AIConfig = {
  provider: 'openai',
  apiKey: '',
  model: 'gpt-4o-mini',
};

const SYSTEM_PROMPTS: Record<Engine, string> = {
  mermaid: `你是一个 Mermaid 图表语法专家。你的任务是：
1. 分析用户提供的 Mermaid 代码，找出语法错误
2. 提供修正建议和正确的代码
3. 解释错误原因
4. 给出改进建议

请以 JSON 格式回复，包含以下字段：
- hasErrors: boolean - 是否有错误
- errors: array - 错误列表，每个错误包含 line(行号), message(错误描述), suggestion(修正建议)
- correctedCode: string - 修正后的完整代码（如果有错误）
- suggestions: array - 改进建议列表
- explanation: string - 总体解释`,

  plantuml: `你是一个 PlantUML 图表语法专家。你的任务是：
1. 分析用户提供的 PlantUML 代码，找出语法错误
2. 提供修正建议和正确的代码
3. 解释错误原因
4. 给出改进建议

请以 JSON 格式回复，包含以下字段：
- hasErrors: boolean - 是否有错误
- errors: array - 错误列表，每个错误包含 line(行号), message(错误描述), suggestion(修正建议)
- correctedCode: string - 修正后的完整代码（如果有错误）
- suggestions: array - 改进建议列表
- explanation: string - 总体解释`,

  graphviz: `你是一个 Graphviz DOT 语法专家。你的任务是：
1. 分析用户提供的 Graphviz DOT 代码，找出语法错误
2. 提供修正建议和正确的代码
3. 解释错误原因
4. 给出改进建议

请以 JSON 格式回复，包含以下字段：
- hasErrors: boolean - 是否有错误
- errors: array - 错误列表，每个错误包含 line(行号), message(错误描述), suggestion(修正建议)
- correctedCode: string - 修正后的完整代码（如果有错误）
- suggestions: array - 改进建议列表
- explanation: string - 总体解释`,

  flowchart: `你是一个 Flowchart 图表语法专家。你的任务是：
1. 分析用户提供的 Flowchart 代码，找出语法错误
2. 提供修正建议和正确的代码
3. 解释错误原因
4. 给出改进建议

请以 JSON 格式回复，包含以下字段：
- hasErrors: boolean - 是否有错误
- errors: array - 错误列表，每个错误包含 line(行号), message(错误描述), suggestion(修正建议)
- correctedCode: string - 修正后的完整代码（如果有错误）
- suggestions: array - 改进建议列表
- explanation: string - 总体解释`,
};

const GENERATION_PROMPTS: Record<Engine, string> = {
  mermaid: `你是一个 Mermaid 图表生成专家。根据用户的描述，生成对应的 Mermaid 代码。
只返回纯 Mermaid 代码，不要包含任何解释或 markdown 代码块标记。`,

  plantuml: `你是一个 PlantUML 图表生成专家。根据用户的描述，生成对应的 PlantUML 代码。
只返回纯 PlantUML 代码（包含 @startuml 和 @enduml），不要包含任何解释或 markdown 代码块标记。`,

  graphviz: `你是一个 Graphviz DOT 图表生成专家。根据用户的描述，生成对应的 DOT 代码。
只返回纯 DOT 代码，不要包含任何解释或 markdown 代码块标记。`,

  flowchart: `你是一个 Flowchart 图表生成专家。根据用户的描述，生成对应的 Flowchart 代码。
只返回纯代码，不要包含任何解释或 markdown 代码块标记。`,
};

const CONFIG_STORAGE_KEY = 'graphviewer:ai-config:v1';

function loadConfig(): AIConfig {
  if (typeof window === 'undefined') return DEFAULT_CONFIG;
  try {
    const raw = window.localStorage.getItem(CONFIG_STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('加载 AI 配置失败:', e);
  }
  return DEFAULT_CONFIG;
}

function saveConfig(config: AIConfig) {
  if (typeof window === 'undefined') return;
  try {
    // 不保存 API Key 到 localStorage（安全考虑），只保存其他配置
    const { apiKey, ...rest } = config;
    window.localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(rest));
  } catch (e) {
    console.error('保存 AI 配置失败:', e);
  }
}

export function useAIAssistant(engine: Engine) {
  const [config, setConfig] = useState<AIConfig>(loadConfig);
  const [state, setState] = useState<AIAssistantState>({
    isAnalyzing: false,
    isGenerating: false,
    lastAnalysis: null,
    error: null,
  });

  // 更新配置
  const updateConfig = useCallback((newConfig: Partial<AIConfig>) => {
    setConfig(prev => {
      const updated = { ...prev, ...newConfig };
      saveConfig(updated);
      return updated;
    });
  }, []);

  // 调用 AI API
  const callAI = useCallback(async (systemPrompt: string, userMessage: string): Promise<string> => {
    const { provider, apiKey, apiEndpoint, model } = config;

    if (!apiKey) {
      throw new Error('请先配置 AI API Key');
    }

    let endpoint: string;
    let headers: Record<string, string>;
    let body: any;

    switch (provider) {
      case 'openai':
        endpoint = apiEndpoint || 'https://api.openai.com/v1/chat/completions';
        headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
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
        headers = {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        };
        body = {
          model: model || 'claude-3-haiku-20240307',
          max_tokens: 4096,
          system: systemPrompt,
          messages: [
            { role: 'user', content: userMessage },
          ],
        };
        break;

      case 'custom':
        if (!apiEndpoint) {
          throw new Error('自定义 API 需要配置 endpoint');
        }
        endpoint = apiEndpoint;
        headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
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
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API 请求失败: ${response.status}`);
    }

    const data = await response.json();

    // 根据不同提供商解析响应
    if (provider === 'anthropic') {
      return data.content?.[0]?.text || '';
    }
    return data.choices?.[0]?.message?.content || '';
  }, [config]);

  // 分析代码
  const analyzeCode = useCallback(async (code: string): Promise<AIAnalysisResult | null> => {
    if (!code.trim()) {
      setState(prev => ({ ...prev, error: '请输入代码' }));
      return null;
    }

    setState(prev => ({ ...prev, isAnalyzing: true, error: null }));

    try {
      const systemPrompt = SYSTEM_PROMPTS[engine];
      const userMessage = `请分析以下 ${engine} 代码：\n\n${code}`;

      const response = await callAI(systemPrompt, userMessage);

      // 尝试解析 JSON 响应
      let result: AIAnalysisResult;
      try {
        // 清理可能的 markdown 代码块
        const cleanResponse = response
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();
        result = JSON.parse(cleanResponse);
      } catch (e) {
        // 如果不是 JSON，尝试从文本中提取信息
        result = {
          hasErrors: false,
          errors: [],
          suggestions: [response],
          explanation: response,
        };
      }

      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        lastAnalysis: result,
      }));

      return result;
    } catch (e: any) {
      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        error: e.message || '分析失败',
      }));
      return null;
    }
  }, [engine, callAI]);

  // 生成代码
  const generateCode = useCallback(async (description: string): Promise<string | null> => {
    if (!description.trim()) {
      setState(prev => ({ ...prev, error: '请输入描述' }));
      return null;
    }

    setState(prev => ({ ...prev, isGenerating: true, error: null }));

    try {
      const systemPrompt = GENERATION_PROMPTS[engine];
      const response = await callAI(systemPrompt, description);

      // 清理可能的 markdown 代码块
      const cleanCode = response
        .replace(/```(?:mermaid|plantuml|dot|graphviz|flowchart)?\n?/gi, '')
        .replace(/```\n?/g, '')
        .trim();

      setState(prev => ({ ...prev, isGenerating: false }));
      return cleanCode;
    } catch (e: any) {
      setState(prev => ({
        ...prev,
        isGenerating: false,
        error: e.message || '生成失败',
      }));
      return null;
    }
  }, [engine, callAI]);

  // 修复代码
  const fixCode = useCallback(async (code: string, errorMessage?: string): Promise<string | null> => {
    if (!code.trim()) {
      setState(prev => ({ ...prev, error: '请输入代码' }));
      return null;
    }

    setState(prev => ({ ...prev, isAnalyzing: true, error: null }));

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

      setState(prev => ({ ...prev, isAnalyzing: false }));
      return cleanCode;
    } catch (e: any) {
      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        error: e.message || '修复失败',
      }));
      return null;
    }
  }, [engine, callAI]);

  // 清除错误
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // 清除分析结果
  const clearAnalysis = useCallback(() => {
    setState(prev => ({ ...prev, lastAnalysis: null }));
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
  };
}
