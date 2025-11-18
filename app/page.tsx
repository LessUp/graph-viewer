 'use client';

import { EditorPanel } from '@/components/EditorPanel';
import { PreviewPanel } from '@/components/PreviewPanel';
import { useDiagramState } from '@/hooks/useDiagramState';
import { useDiagramRender } from '@/hooks/useDiagramRender';
import { SAMPLES } from '@/lib/diagramSamples';

export default function Page() {
  const { engine, format, code, codeStats, setEngine, setFormat, setCode } = useDiagramState(SAMPLES['mermaid']);

  const {
    svg,
    base64,
    contentType,
    loading,
    error,
    canUseLocalRender,
    showPreview,
    renderDiagram,
    downloadDiagram,
    clearError,
    setError,
    resetOutput,
  } = useDiagramRender(engine, format, code);

  async function handleCopyShareLink() {
    clearError();
    try {
      if (typeof window === 'undefined') return;
      const url = new URL(window.location.href);
      const params = url.searchParams;
      params.set('engine', engine);
      params.set('format', format);
      params.set('code', code);
      url.search = params.toString();
      const finalUrl = url.toString();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(finalUrl);
      } else {
        window.prompt('请手动复制以下链接', finalUrl);
      }
    } catch (e: any) {
      setError(e?.message || '复制分享链接失败');
    }
  }

  async function handleCopyCode() {
    clearError();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(code);
      } else {
        window.prompt('请手动复制以下代码', code);
      }
    } catch (e: any) {
      setError(e?.message || '复制代码失败');
    }
  }

  function handleClearCode() {
    setCode('');
    resetOutput();
  }

  function handleFormatCode() {
    if (!code) return;
    const formatted = code.replace(/\t/g, '  ');
    setCode(formatted);
  }

  return (
    <main className="relative isolate mx-auto flex max-w-6xl flex-col gap-10 px-4 py-10 md:px-8 lg:gap-12 lg:py-16">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-[-20%] h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-sky-400/25 blur-3xl" />
        <div className="absolute right-[-10%] top-[35%] h-[28rem] w-[28rem] rounded-full bg-indigo-300/20 blur-3xl" />
      </div>

      <section className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-10 text-white shadow-2xl ring-1 ring-white/10 md:px-10">
        <div className="absolute right-6 top-6 hidden h-28 w-28 rotate-12 rounded-full bg-sky-400/20 blur-2xl md:block" />
        <div className="absolute -left-10 bottom-0 hidden h-32 w-32 -rotate-12 rounded-full bg-violet-500/20 blur-2xl md:block" />
        <div className="relative z-10 space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-100">
            即时渲染 · 多格式输出
          </span>
          <div className="space-y-4">
            <h1 className="text-3xl font-semibold leading-tight md:text-4xl">
              图形语法一站式可视化工具
            </h1>
            <p className="max-w-3xl text-sm text-slate-200 md:text-base">
              通过 Mermaid、PlantUML、Graphviz 等语法快速生成图表。输入代码即可实时预览，轻松导出高质量的 SVG、PNG 或 PDF 文件。
            </p>
          </div>
          <ul className="flex flex-wrap gap-3 text-sm text-slate-200">
            <li className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
              <span className="inline-flex h-2 w-2 rounded-full bg-sky-300" />本地极速渲染
            </li>
            <li className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-300" />响应式界面体验
            </li>
            <li className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
              <span className="inline-flex h-2 w-2 rounded-full bg-amber-300" />多格式文件导出
            </li>
          </ul>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <EditorPanel
          engine={engine}
          format={format}
          code={code}
          codeStats={codeStats}
          loading={loading}
          error={error}
          canUseLocalRender={canUseLocalRender}
          onEngineChange={setEngine}
          onFormatChange={setFormat}
          onCodeChange={setCode}
          onRender={renderDiagram}
          onDownload={downloadDiagram}
          onCopyShareLink={handleCopyShareLink}
          onCopyCode={handleCopyCode}
          onClearCode={handleClearCode}
          onFormatCode={handleFormatCode}
        />

        <PreviewPanel
          engine={engine}
          format={format}
          svg={svg}
          base64={base64}
          contentType={contentType}
          loading={loading}
        />
      </div>
    </main>
  );
}

