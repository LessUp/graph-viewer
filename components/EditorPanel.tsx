'use client';

import { memo } from 'react';
import type { Engine } from '@/lib/diagramConfig';
import { ENGINE_LABELS, ENGINE_CONFIGS } from '@/lib/diagramConfig';
import { SAMPLES } from '@/lib/diagramSamples';
import { CodeEditor } from '@/components/CodeEditor';

export type EditorPanelProps = {
  engine: Engine;
  code: string;
  codeStats: { lines: number; chars: number };
  loading: boolean;
  error: string;
  canUseLocalRender: boolean;
  livePreviewEnabled: boolean;
  onLivePreviewChange: (enabled: boolean) => void;
  onEngineChange: (engine: Engine) => void;
  onCodeChange: (code: string) => void;
  onRender: () => Promise<void> | void;
  onCopyShareLink: () => Promise<void> | void;
  onCopyCode: () => Promise<void> | void;
  onClearCode: () => void;
  onFormatCode: () => void;
};

// 常用引擎列表
const COMMON_ENGINES: Engine[] = ['mermaid', 'plantuml', 'graphviz', 'flowchart'];

function EditorPanelComponent(props: EditorPanelProps) {
  const {
    engine,
    code,
    codeStats,
    loading,
    error,
    canUseLocalRender,
    livePreviewEnabled,
    onLivePreviewChange,
    onEngineChange,
    onCodeChange,
    onRender,
    onCopyShareLink,
    onCopyCode,
    onClearCode,
    onFormatCode,
  } = props;

  const currentEngineConfig = ENGINE_CONFIGS[engine];

  return (
    <div className="flex h-full flex-col space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900">代码编辑</h2>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 cursor-pointer">
            <input
              type="checkbox"
              checked={livePreviewEnabled}
              onChange={(e) => onLivePreviewChange(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
            />
            实时预览
          </label>
          {canUseLocalRender && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
              <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 8 8">
                <circle cx="4" cy="4" r="3" />
              </svg>
              本地渲染
            </span>
          )}
        </div>
      </div>

      {/* 引擎选择器 - 简化版 */}
      <select
        value={engine}
        onChange={(e) => onEngineChange(e.target.value as Engine)}
        className="w-full rounded-xl border border-slate-200 bg-gradient-to-r from-slate-50 to-white px-4 py-2.5 text-sm font-medium text-slate-800 shadow-sm transition hover:border-slate-300 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
      >
        {COMMON_ENGINES.map((eng) => (
          <option key={eng} value={eng}>
            {ENGINE_LABELS[eng]}
          </option>
        ))}
      </select>

      {/* 操作按钮 */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onRender}
          disabled={loading || !code.trim()}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-sky-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loading ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              渲染中
            </>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              渲染
            </>
          )}
        </button>
        <button
          type="button"
          onClick={onCopyShareLink}
          disabled={!code.trim()}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-white px-3 py-2 text-sm font-medium text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 disabled:opacity-50 transition"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          分享
        </button>
        <button
          type="button"
          onClick={onCopyCode}
          disabled={!code.trim()}
          className="inline-flex items-center justify-center rounded-lg p-2 text-slate-500 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-50 transition"
          title="复制代码"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
      </div>

      {/* 编辑器区域 */}
      <div className="flex flex-1 flex-col space-y-2 overflow-hidden min-h-0">
        <div className="flex items-center justify-between text-xs text-slate-500">
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
          <div className="flex gap-2">
            <button 
              onClick={() => onCodeChange(SAMPLES[engine])} 
              className="hover:text-sky-600 transition"
            >
              示例
            </button>
            <button 
              onClick={onFormatCode} 
              disabled={!code} 
              className="hover:text-sky-600 disabled:opacity-30 transition"
            >
              格式化
            </button>
            <button 
              onClick={onClearCode} 
              disabled={!code} 
              className="hover:text-rose-600 disabled:opacity-30 transition"
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
            onCtrlEnter={() => {
              if (!loading && code.trim()) {
                void onRender();
              }
            }}
          />
        </div>
        
        <div className="flex justify-between text-[10px] text-slate-400">
          <span>{codeStats.lines} 行 · {codeStats.chars} 字符</span>
          <span className="flex items-center gap-1">
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
            <svg className="h-4 w-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// 使用 memo 优化性能
const EditorPanel = memo(EditorPanelComponent);
export { EditorPanel };
export default EditorPanel;
