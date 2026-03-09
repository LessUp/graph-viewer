'use client';

import { memo } from 'react';
import type { Engine, Format } from '@/lib/diagramConfig';
import { ENGINE_LABELS, ENGINE_CONFIGS, ENGINE_CATEGORIES, FORMAT_LABELS } from '@/lib/diagramConfig';
import { SAMPLES } from '@/lib/diagramSamples';
import { CodeEditor } from '@/components/CodeEditor';
import { PlayCircle, Loader2, Copy, AlertCircle } from 'lucide-react';

export type EditorPanelProps = {
  engine: Engine;
  format: Format;
  code: string;
  codeStats: { lines: number; chars: number };
  loading: boolean;
  error: string;
  canUseLocalRender: boolean;
  livePreviewEnabled: boolean;
  onLivePreviewChange: (enabled: boolean) => void;
  onEngineChange: (engine: Engine, loadSample?: boolean) => void;
  onFormatChange: (format: Format) => void;
  onCodeChange: (code: string) => void;
  onRender: () => Promise<void> | void;
  onCopyCode: () => Promise<void> | void;
  onClearCode: () => void;
  editorFontSize?: number;
};


function EditorPanelComponent(props: EditorPanelProps) {
  const {
    engine,
    format,
    code,
    codeStats,
    loading,
    error,
    canUseLocalRender,
    livePreviewEnabled,
    onLivePreviewChange,
    onEngineChange,
    onFormatChange,
    onCodeChange,
    onRender,
    onCopyCode,
    onClearCode,
    editorFontSize = 13,
  } = props;

  // 切换引擎时自动加载示例代码
  const handleEngineChange = (newEngine: Engine) => {
    onEngineChange(newEngine, true);
  };

  const currentEngineConfig = ENGINE_CONFIGS[engine];

  return (
    <div className="flex h-full flex-col space-y-4 overflow-hidden rounded-[24px] border border-white/70 bg-white/90 p-4 shadow-sm backdrop-blur md:p-5">
      {/* 头部 - 引擎选择和实时预览 */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row">
          <select
            value={engine}
            onChange={(e) => handleEngineChange(e.target.value as Engine)}
            className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
          >
            {Object.entries(ENGINE_CATEGORIES).map(([category, engines]) => (
              <optgroup key={category} label={category}>
                {engines.map((eng) => (
                  <option key={eng} value={eng}>
                    {ENGINE_LABELS[eng]}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <select
            value={format}
            onChange={(e) => onFormatChange(e.target.value as Format)}
            className="w-24 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
          >
            {Object.entries(FORMAT_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center justify-between gap-2 md:justify-end">
          <label className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={livePreviewEnabled}
              onChange={(e) => onLivePreviewChange(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
            />
            实时
          </label>
          {canUseLocalRender && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600">
              <span className="h-2 w-2 rounded-full bg-current" />
              本地
            </span>
          )}
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={onRender}
          disabled={loading || !code.trim()}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-1"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              渲染中
            </>
          ) : (
            <>
              <PlayCircle className="h-4 w-4" />
              渲染
            </>
          )}
        </button>
        <button
          type="button"
          onClick={onCopyCode}
          disabled={!code.trim()}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-white px-3 py-2.5 text-sm font-medium text-slate-600 ring-1 ring-inset ring-slate-200 transition hover:bg-slate-50 hover:text-slate-800 disabled:opacity-50 sm:min-w-[112px]"
          title="复制代码"
        >
          <Copy className="h-4 w-4" />
          复制
        </button>
      </div>

      {/* 编辑器区域 */}
      <div className="flex flex-1 flex-col space-y-2 overflow-hidden min-h-0">
        <div className="flex flex-col gap-2 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="font-medium">代码编辑器</span>
            {currentEngineConfig.docUrl && (
              <a
                href={currentEngineConfig.docUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-500 hover:text-sky-600 hover:underline"
              >
                文档 ↗
              </a>
            )}
          </div>
          <div className="flex gap-3 text-[11px]">
            <button
              onClick={() => onCodeChange(SAMPLES[engine])}
              className="hover:text-sky-600 transition"
            >
              加载示例
            </button>
            <button
              onClick={onClearCode}
              disabled={!code}
              className="hover:text-rose-500 disabled:opacity-30 transition"
            >
              清空
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 min-h-0">
          <CodeEditor
            value={code}
            onChange={onCodeChange}
            disabled={loading}
            engine={engine}
            minHeight="100%"
            fontSize={editorFontSize}
            onCtrlEnter={() => {
              if (!loading && code.trim()) {
                void onRender();
              }
            }}
          />
        </div>

        <div className="flex flex-col gap-2 text-[10px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <span>{codeStats.lines} 行 · {codeStats.chars} 字符</span>
          <span className="flex items-center gap-1">
            <kbd className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[9px]">Ctrl</kbd>
            <span>/</span>
            <kbd className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[9px]">⌘</kbd>
            <span>+</span>
            <kbd className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[9px]">Enter</kbd>
            <span>渲染</span>
          </span>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-600 ring-1 ring-inset ring-rose-500/10">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// 使用 memo 优化性能
export const EditorPanel = memo(EditorPanelComponent);
