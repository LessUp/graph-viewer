'use client';

import { useState } from 'react';
import type { AIConfig, AIProvider, AIAnalysisResult } from '@/hooks/useAIAssistant';
import {
  Zap,
  Loader2,
  Lightbulb,
  Pencil,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Key,
} from 'lucide-react';

export type AIAssistantPanelProps = {
  config: AIConfig;
  isConfigured: boolean;
  isAnalyzing: boolean;
  isGenerating: boolean;
  lastAnalysis: AIAnalysisResult | null;
  error: string | null;
  onUpdateConfig: (config: Partial<AIConfig>) => void;
  onAnalyze: () => void;
  onFix: () => void;
  onGenerate: (description: string) => void;
  onApplyCode: (code: string) => void;
  onClearError: () => void;
  onClearAnalysis: () => void;
};

const PROVIDERS: Array<{ id: AIProvider; name: string; description: string }> = [
  { id: 'openai', name: 'OpenAI', description: 'GPT-4, GPT-3.5 等模型' },
  { id: 'anthropic', name: 'Anthropic', description: 'Claude 系列模型' },
  { id: 'custom', name: '自定义', description: '自定义 API 端点' },
];

const OPENAI_MODELS = [
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini (推荐)' },
  { id: 'gpt-4o', name: 'GPT-4o' },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
];

const ANTHROPIC_MODELS = [
  { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku (快速)' },
  { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet' },
  { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus' },
];

export function AIAssistantPanel(props: AIAssistantPanelProps) {
  const {
    config,
    isConfigured,
    isAnalyzing,
    isGenerating,
    lastAnalysis,
    error,
    onUpdateConfig,
    onAnalyze,
    onFix,
    onGenerate,
    onApplyCode,
    onClearError,
    onClearAnalysis,
  } = props;

  const [showConfig, setShowConfig] = useState(!isConfigured);
  const [generatePrompt, setGeneratePrompt] = useState('');
  const [activeTab, setActiveTab] = useState<'analyze' | 'generate'>('analyze');

  const models =
    config.provider === 'openai'
      ? OPENAI_MODELS
      : config.provider === 'anthropic'
        ? ANTHROPIC_MODELS
        : [];

  const handleGenerate = () => {
    if (generatePrompt.trim()) {
      onGenerate(generatePrompt);
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* 头部 */}
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <h3 className="text-sm font-semibold text-slate-700">AI 助手</h3>
        </div>
        <button
          onClick={() => setShowConfig(!showConfig)}
          className={`rounded-lg px-2 py-1 text-xs ${showConfig ? 'bg-slate-100 text-slate-700' : 'text-slate-500 hover:bg-slate-100'}`}
        >
          {showConfig ? '隐藏设置' : '设置'}
        </button>
      </div>

      {/* 配置面板 */}
      {showConfig && (
        <div className="space-y-4 border-b border-slate-200 bg-slate-50 p-4">
          {/* 提供商选择 */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">AI 服务提供商</label>
            <div className="grid grid-cols-3 gap-2">
              {PROVIDERS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => onUpdateConfig({ provider: p.id })}
                  className={`rounded-lg border p-2 text-left transition ${
                    config.provider === p.id
                      ? 'border-violet-500 bg-violet-50 text-violet-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div className="text-xs font-medium">{p.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* API Key */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">API Key</label>
            <input
              type="password"
              value={config.apiKey}
              onChange={(e) => onUpdateConfig({ apiKey: e.target.value })}
              placeholder="输入您的 API Key"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
            <p className="mt-1 text-[10px] text-slate-400">
              API Key 仅存储在本地浏览器中，不会上传到服务器
            </p>
          </div>

          {/* 模型选择 */}
          {models.length > 0 && (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">模型</label>
              <select
                value={config.model}
                onChange={(e) => onUpdateConfig({ model: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none"
              >
                {models.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 自定义端点 */}
          {config.provider === 'custom' && (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">API 端点</label>
              <input
                type="url"
                value={config.apiEndpoint || ''}
                onChange={(e) => onUpdateConfig({ apiEndpoint: e.target.value })}
                placeholder="https://api.example.com/v1/chat/completions"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none"
              />
            </div>
          )}
        </div>
      )}

      {/* 功能选项卡 */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('analyze')}
          className={`flex-1 px-4 py-2.5 text-xs font-medium transition ${
            activeTab === 'analyze'
              ? 'border-b-2 border-violet-500 text-violet-600'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          代码分析
        </button>
        <button
          onClick={() => setActiveTab('generate')}
          className={`flex-1 px-4 py-2.5 text-xs font-medium transition ${
            activeTab === 'generate'
              ? 'border-b-2 border-violet-500 text-violet-600'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          智能生成
        </button>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto p-4">
        {!isConfigured ? (
          <div className="flex flex-col items-center justify-center py-8 text-slate-400">
            <Key className="mb-3 h-12 w-12" strokeWidth={1.5} />
            <p className="text-sm">请先配置 API Key</p>
            <p className="mt-1 text-xs">点击上方「设置」按钮进行配置</p>
          </div>
        ) : activeTab === 'analyze' ? (
          <div className="space-y-4">
            {/* 分析按钮 */}
            <div className="flex gap-2">
              <button
                onClick={onAnalyze}
                disabled={isAnalyzing}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-violet-700 disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    分析中...
                  </>
                ) : (
                  <>
                    <Lightbulb className="h-4 w-4" />
                    分析代码
                  </>
                )}
              </button>
              <button
                onClick={onFix}
                disabled={isAnalyzing}
                className="flex items-center gap-2 rounded-lg border border-violet-200 bg-violet-50 px-4 py-2.5 text-sm font-medium text-violet-600 transition hover:bg-violet-100 disabled:opacity-50"
              >
                <Pencil className="h-4 w-4" />
                自动修复
              </button>
            </div>

            {/* 错误提示 */}
            {error && (
              <div className="flex items-start gap-2 rounded-lg bg-rose-50 p-3 text-xs text-rose-600">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <div className="flex-1">
                  <p>{error}</p>
                  <button
                    onClick={onClearError}
                    className="mt-1 text-rose-500 underline hover:text-rose-700"
                  >
                    关闭
                  </button>
                </div>
              </div>
            )}

            {/* 分析结果 */}
            {lastAnalysis && (
              <div className="space-y-3">
                {/* 状态 */}
                <div
                  className={`flex items-center gap-2 rounded-lg p-3 ${
                    lastAnalysis.hasErrors
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-emerald-50 text-emerald-700'
                  }`}
                >
                  {lastAnalysis.hasErrors ? (
                    <AlertTriangle className="h-5 w-5" />
                  ) : (
                    <CheckCircle className="h-5 w-5" />
                  )}
                  <span className="text-sm font-medium">
                    {lastAnalysis.hasErrors
                      ? `发现 ${lastAnalysis.errors.length} 个问题`
                      : '代码看起来没问题！'}
                  </span>
                </div>

                {/* 错误列表 */}
                {lastAnalysis.errors.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-slate-600">问题列表</h4>
                    {lastAnalysis.errors.map((err, idx) => (
                      <div key={idx} className="rounded-lg border border-slate-200 bg-white p-3">
                        <div className="flex items-start gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded bg-amber-100 text-[10px] font-bold text-amber-600">
                            {idx + 1}
                          </span>
                          <div className="flex-1">
                            {err.line && (
                              <span className="text-[10px] text-slate-400">第 {err.line} 行</span>
                            )}
                            <p className="text-xs text-slate-700">{err.message}</p>
                            {err.suggestion && (
                              <p className="mt-1 text-[11px] text-slate-500">💡 {err.suggestion}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 修正后的代码 */}
                {lastAnalysis.correctedCode && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-medium text-slate-600">修正后的代码</h4>
                      <button
                        onClick={() => onApplyCode(lastAnalysis.correctedCode!)}
                        className="text-xs font-medium text-violet-600 hover:text-violet-700"
                      >
                        应用修改
                      </button>
                    </div>
                    <div className="max-h-48 overflow-y-auto whitespace-pre-wrap rounded-lg bg-slate-100 p-3 font-mono text-[11px] text-slate-600">
                      {lastAnalysis.correctedCode}
                    </div>
                  </div>
                )}

                {/* 建议 */}
                {lastAnalysis.suggestions.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-slate-600">改进建议</h4>
                    <ul className="space-y-1">
                      {lastAnalysis.suggestions.map((s, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                          <span className="text-violet-500">•</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 解释 */}
                {lastAnalysis.explanation && (
                  <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
                    {lastAnalysis.explanation}
                  </div>
                )}

                {/* 清除按钮 */}
                <button
                  onClick={onClearAnalysis}
                  className="w-full text-center text-xs text-slate-400 hover:text-slate-600"
                >
                  清除分析结果
                </button>
              </div>
            )}
          </div>
        ) : (
          /* 智能生成 */
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                描述您想要生成的图表
              </label>
              <textarea
                value={generatePrompt}
                onChange={(e) => setGeneratePrompt(e.target.value)}
                placeholder="例如：创建一个展示用户登录流程的时序图，包含用户、前端、后端和数据库四个参与者..."
                rows={4}
                className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none"
              />
            </div>
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !generatePrompt.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-violet-700 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  生成图表
                </>
              )}
            </button>

            {/* 示例提示 */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-500">快速示例：</p>
              <div className="flex flex-wrap gap-2">
                {['用户注册流程图', '微服务架构图', 'API 调用时序图', '状态机图'].map((example) => (
                  <button
                    key={example}
                    onClick={() => setGeneratePrompt(example)}
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 transition hover:bg-slate-200"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
