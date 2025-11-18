import type { Engine, Format } from '@/lib/diagramConfig';
import { ENGINE_LABELS, FORMAT_LABELS } from '@/lib/diagramConfig';

export type PreviewPanelProps = {
  engine: Engine;
  format: Format;
  svg: string;
  base64: string;
  contentType: string;
  loading: boolean;
};

export function PreviewPanel(props: PreviewPanelProps) {
  const { engine, format, svg, base64, contentType, loading } = props;

  const showPreview = (() => {
    if (format === 'svg') return Boolean(svg);
    return Boolean(base64);
  })();

  return (
    <div className="space-y-6 rounded-2xl border border-white/60 bg-white/90 p-6 shadow-xl backdrop-blur md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">实时预览</h2>
          <p className="text-sm text-slate-500">根据所选格式展示输出效果。</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
            当前引擎：{ENGINE_LABELS[engine]}
          </span>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
            当前格式：{FORMAT_LABELS[format]}
          </span>
        </div>
      </div>
      <div className="relative flex min-h-[22rem] items-center justify-center overflow-hidden rounded-2xl border border-dashed border-slate-200 bg-white">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-sm">
            <svg className="h-9 w-9 animate-spin text-sky-500" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
          </div>
        )}
        {!showPreview && !loading && (
          <div className="flex flex-col items-center gap-2 text-sm text-slate-400">
            <svg className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
              <path d="M10 12h4" />
              <path d="M10 15h6" />
            </svg>
            暂无预览，请输入代码后点击渲染。
          </div>
        )}
        {format === 'svg' && svg && (
          <div className="relative h-full w-full overflow-auto p-4" aria-label="SVG 预览">
            <div className="mx-auto max-w-full" dangerouslySetInnerHTML={{ __html: svg }} />
          </div>
        )}
        {format === 'png' && base64 && (
          <div className="relative h-full w-full overflow-auto p-4" aria-label="PNG 预览">
            <img
              src={`data:${contentType};base64,${base64}`}
              alt="diagram preview"
              className="mx-auto max-h-[30rem] w-auto max-w-full rounded-xl shadow"
            />
          </div>
        )}
        {format === 'pdf' && base64 && (
          <iframe
            title="diagram preview"
            src={`data:application/pdf;base64,${base64}`}
            className="h-[28rem] w-full rounded-xl border border-slate-200"
          />
        )}
      </div>
      <p className="text-xs text-slate-500">SVG 支持无限缩放，PNG 适合嵌入文档，PDF 便于打印与分享。</p>
    </div>
  );
}

export default PreviewPanel;
