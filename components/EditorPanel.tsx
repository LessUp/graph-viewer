'use client';

import type { Engine, Format } from '@/lib/diagramConfig';
import { ENGINE_LABELS, FORMAT_LABELS } from '@/lib/diagramConfig';
import { SAMPLES } from '@/lib/diagramSamples';
import { CodeEditor } from '@/components/CodeEditor';

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
  onEngineChange: (engine: Engine) => void;
  onFormatChange: (format: Format) => void;
  onCodeChange: (code: string) => void;
  onRender: () => Promise<void> | void;
  onDownload: () => Promise<void> | void;
  onCopyShareLink: () => Promise<void> | void;
  onCopyCode: () => Promise<void> | void;
  onClearCode: () => void;
  onFormatCode: () => void;
};

export function EditorPanel(props: EditorPanelProps) {
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
    onDownload,
    onCopyShareLink,
    onCopyCode,
    onClearCode,
    onFormatCode,
  } = props;

  const showPreview = Boolean(code.trim());

  return (
    <div className="space-y-6 rounded-2xl border border-white/60 bg-white/80 p-6 shadow-xl backdrop-blur md:p-8">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-slate-900">配置与编辑</h2>
        <p className="text-sm text-slate-500">选择渲染引擎与输出格式，编辑你的图形脚本。</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          渲染引擎
          <select
            value={engine}
            onChange={(e) => onEngineChange(e.target.value as Engine)}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
          >
            {(Object.keys(SAMPLES) as Engine[]).map((value) => (
              <option key={value} value={value}>
                {ENGINE_LABELS[value]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          输出格式
          <select
            value={format}
            onChange={(e) => onFormatChange(e.target.value as Format)}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
          >
            {(Object.keys(FORMAT_LABELS) as Format[]).map((value) => (
              <option key={value} value={value}>
                {FORMAT_LABELS[value]}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onRender}
          disabled={loading || !code.trim()}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-600/40 transition hover:bg-sky-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? '渲染中…' : '渲染预览'}
        </button>
        <button
          type="button"
          onClick={onDownload}
          disabled={!showPreview || loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-sky-400 hover:text-sky-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          下载文件
        </button>
        <button
          type="button"
          onClick={onCopyShareLink}
          disabled={!code.trim()}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-sky-400 hover:text-sky-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          复制分享链接
        </button>
        <label className="flex items-center gap-1 text-xs text-slate-600">
          <input
            type="checkbox"
            checked={livePreviewEnabled}
            onChange={(e) => onLivePreviewChange(e.target.checked)}
            className="h-3.5 w-3.5 rounded border-slate-300 text-sky-600 focus:ring-sky-200"
          />
          实时预览（防抖）
        </label>
        {canUseLocalRender && (
          <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            本地渲染已启用
          </span>
        )}
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-slate-700">图形代码</span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onCodeChange(SAMPLES[engine])}
              className="text-xs font-medium text-sky-600 transition hover:text-sky-500"
            >
              恢复示例
            </button>
            <button
              type="button"
              onClick={onCopyCode}
              disabled={!code.trim()}
              className="text-xs font-medium text-slate-500 transition hover:text-slate-700 disabled:opacity-40"
            >
              复制代码
            </button>
            <button
              type="button"
              onClick={onClearCode}
              disabled={!code}
              className="text-xs font-medium text-rose-500 transition hover:text-rose-600 disabled:opacity-40"
            >
              清空代码
            </button>
            <button
              type="button"
              onClick={onFormatCode}
              disabled={!code}
              className="text-xs font-medium text-slate-500 transition hover:text-slate-700 disabled:opacity-40"
            >
              格式化缩进
            </button>
          </div>
        </div>
        <div className="min-h-[22rem] w-full">
          <CodeEditor
            value={code}
            onChange={onCodeChange}
            disabled={loading}
            onCtrlEnter={() => {
              if (!loading && code.trim()) {
                void onRender();
              }
            }}
          />
        </div>
        <p className="text-xs text-slate-400">
          当前代码：{codeStats.lines} 行 · {codeStats.chars} 字符
        </p>
        <p className="text-xs text-slate-500">
          支持 Mermaid、Flowchart.js、PlantUML 与 Graphviz 语法。切换渲染引擎即可查看对应示例。
        </p>
      </div>
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600" role="alert" aria-live="polite">
          {error}
        </div>
      )}
    </div>
  );
}

export default EditorPanel;
