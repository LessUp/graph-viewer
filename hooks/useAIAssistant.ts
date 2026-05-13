/**
 * AI 助手 Hook
 *
 * 管理图表代码的 AI 分析、生成和修复。
 * API 调用逻辑委托给 AiClient，配置管理委托给 AiConfig。
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type { Engine } from '@/lib/diagramConfig';
import {
  aiClient,
  buildAnalysisPrompt,
  buildGenerationPrompt,
  buildFixPrompt,
  loadAIConfig,
  saveAIConfig,
  normalizeAIConfig,
  getDefaultModelForProvider,
  getAIBoundaryNotice,
  getAIAssistantMeta,
} from '@/lib/ai';
import type { AIConfig, AIAnalysisResult, AIAssistantState } from '@/lib/ai';

// ============================================================================
// Re-exports for backward compatibility
// ============================================================================

export type {
  AIProvider,
  AIConfig,
  AIAnalysisResult,
  AIAssistantState,
  AIAssistantMeta,
} from '@/lib/ai';

export {
  getAIBoundaryNotice,
  getAIAssistantMeta,
  isAIProviderSelectable,
  getVisibleAIProviders,
  isCustomAIProvider,
  getDefaultModelForProvider,
  normalizeAIConfig,
} from '@/lib/ai';

// ============================================================================
// Hook
// ============================================================================

export function useAIAssistant(engine: Engine) {
  const [config, setConfig] = useState<AIConfig>(loadAIConfig);
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
      saveAIConfig(updated);
      return updated;
    });
  }, []);

  const analyzeCode = useCallback(
    async (code: string): Promise<AIAnalysisResult> => {
      setState((prev) => ({ ...prev, isAnalyzing: true, error: null }));

      try {
        const systemPrompt = buildAnalysisPrompt(engine);
        const userMessage = `请分析以下 ${engine} 代码：\n\n${code}`;
        const response = await aiClient.call(configRef.current, {
          systemPrompt,
          userMessage,
        });

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
    [engine],
  );

  const generateCode = useCallback(
    async (description: string): Promise<string | null> => {
      setState((prev) => ({ ...prev, isGenerating: true, error: null }));

      try {
        const systemPrompt = buildGenerationPrompt(engine);
        const response = await aiClient.call(configRef.current, {
          systemPrompt,
          userMessage: description,
        });
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
    [engine],
  );

  const fixCode = useCallback(
    async (code: string, errorMessage?: string): Promise<string | null> => {
      if (!code.trim()) {
        setState((prev) => ({ ...prev, error: '请输入代码' }));
        return null;
      }

      setState((prev) => ({ ...prev, isAnalyzing: true, error: null }));

      try {
        const systemPrompt = buildFixPrompt(engine);
        const userMessage = errorMessage
          ? `错误信息：${errorMessage}\n\n代码：\n${code}`
          : `请修复以下代码：\n${code}`;

        const response = await aiClient.call(configRef.current, {
          systemPrompt,
          userMessage,
        });
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
    [engine],
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
