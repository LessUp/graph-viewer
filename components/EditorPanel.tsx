
'use client';

import type { Engine } from '@/lib/diagramConfig';
import { ENGINE_LABELS } from '@/lib/diagramConfig';
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

export function EditorPanel(props: EditorPanelProps) {
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

  return (
    <div className="flex h-full flex-col space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900">代码编辑</h2>
        <div className="flex items-center gap-2">
           <label className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900">
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
              本地渲染
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <select
          value={engine}
          onChange={(e) => onEngineChange(e.target.value as Engine)}
          className="block w-full rounded-lg border-0 py-2 text-sm text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:text-sm sm:leading-6"
        >
          {(Object.keys(SAMPLES) as Engine[]).map((value) => (
            <option key={value} value={value}>
              {ENGINE_LABELS[value]}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onRender}
          disabled={loading || !code.trim()}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-sky-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 disabled:opacity-50 disabled:cursor-not-allowed"
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
            '渲染'
          )}
        </button>
        <button
          type="button"
          onClick={onCopyShareLink}
          disabled={!code.trim()}
          className="inline-flex items-center justify-center rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-900 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 disabled:opacity-50"
        >
          分享
        </button>
      </div>

      <div className="flex flex-1 flex-col space-y-2 overflow-hidden">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>代码编辑器</span>
          <div className="flex gap-2">
            <button onClick={() => onCodeChange(SAMPLES[engine])} className="hover:text-sky-600">
              重置
            </button>
            <button onClick={onFormatCode} disabled={!code} className="hover:text-sky-600 disabled:opacity-30">
              格式化
            </button>
            <button onClick={onClearCode} disabled={!code} className="hover:text-rose-600 disabled:opacity-30">
              清空
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
          <div className="h-full w-full overflow-auto">
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
        </div>
        
        <div className="flex justify-between text-[10px] text-slate-400">
          <span>{codeStats.lines} 行, {codeStats.chars} 字符</span>
          <span>Cmd/Ctrl + Enter 运行</span>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-600 ring-1 ring-inset ring-rose-500/10">
          {error}
        </div>
      )}
    </div>
  );
}

export default EditorPanel;
