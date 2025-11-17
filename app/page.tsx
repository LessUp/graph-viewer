'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type Engine = 'mermaid' | 'plantuml' | 'graphviz' | 'flowchart';
type Format = 'svg' | 'png' | 'pdf';

const SAMPLES: Record<Engine, string> = {
  mermaid: 'flowchart TD\nA[开始] --> B{条件?}\nB --是--> C[处理]\nB --否--> D[结束]',
  flowchart: 'flowchart TD\nA[Start] --> B{Is it?}\nB -- Yes --> C[OK]\nB -- No --> D[End]',
  graphviz: 'digraph G {\n  rankdir=LR;\n  A -> B -> C;\n  A -> D;\n}',
  plantuml: '@startuml\nstart\nif (条件?) then (是)\n  :处理;\nelse (否)\n  stop\nendif\n@enduml',
};

const ENGINE_LABELS: Record<Engine, string> = {
  mermaid: 'Mermaid',
  flowchart: 'Flowchart.js',
  plantuml: 'PlantUML',
  graphviz: 'Graphviz',
};

const FORMAT_LABELS: Record<Format, string> = {
  svg: 'SVG',
  png: 'PNG',
  pdf: 'PDF',
};

const LOCAL_STORAGE_KEY = 'graphviewer:state:v1';

let mermaidPromise: Promise<any> | null = null;
let graphvizPromise: Promise<any> | null = null;

async function loadMermaid() {
  if (!mermaidPromise) {
    mermaidPromise = import('mermaid')
      .then((module) => {
        const mermaid = module?.default ?? module;
        if (mermaid?.initialize) {
          mermaid.initialize({ startOnLoad: false, theme: 'neutral' });
        }
        return mermaid;
      })
      .catch((error) => {
        mermaidPromise = null;
        throw error;
      });
  }
  return mermaidPromise;
}

  async function loadGraphviz() {
    if (!graphvizPromise) {
    graphvizPromise = import('@hpcc-js/wasm')
      .then(async (module) => {
        const g = (module as any).graphviz ?? module;
        if (g?.wasmFolder) {
          g.wasmFolder('https://cdn.jsdelivr.net/npm/@hpcc-js/wasm/dist');
        }
        if (g?.load) {
          await g.load();
        }
        return g;
      })
      .catch((error) => {
        graphvizPromise = null;
        throw error;
      });
    }
    return graphvizPromise;
  }

export default function Page() {
  const [engine, setEngine] = useState<Engine>('mermaid');
  const [format, setFormat] = useState<Format>('svg');
  const [code, setCode] = useState<string>(SAMPLES['mermaid']);
  const [svg, setSvg] = useState<string>('');
  const [base64, setBase64] = useState<string>('');
  const [contentType, setContentType] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const engines: Engine[] = ['mermaid', 'plantuml', 'graphviz', 'flowchart'];
      const formats: Format[] = ['svg', 'png', 'pdf'];

      const params = new URLSearchParams(window.location.search);
      const qsEngine = params.get('engine') as Engine | null;
      const qsFormat = params.get('format') as Format | null;
      const qsCode = params.get('code');
      let appliedFromQuery = false;
      if (qsEngine && engines.includes(qsEngine)) {
        setEngine(qsEngine);
        appliedFromQuery = true;
      }
      if (qsFormat && formats.includes(qsFormat)) {
        setFormat(qsFormat);
        appliedFromQuery = true;
      }
      if (qsCode !== null) {
        setCode(qsCode);
        appliedFromQuery = true;
      }
      if (appliedFromQuery) return;

      const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { engine?: Engine; format?: Format; code?: string };
      if (parsed.engine && engines.includes(parsed.engine)) {
        setEngine(parsed.engine);
      }
      if (parsed.format && formats.includes(parsed.format)) {
        setFormat(parsed.format);
      }
      if (typeof parsed.code === 'string') {
        setCode(parsed.code);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const payload = JSON.stringify({ engine, format, code });
      window.localStorage.setItem(LOCAL_STORAGE_KEY, payload);
    } catch {}
  }, [engine, format, code]);

  useEffect(() => {
    if (engine === 'mermaid' || engine === 'flowchart') {
      loadMermaid().catch(() => undefined);
    }
    if (engine === 'graphviz') {
      loadGraphviz().catch(() => undefined);
    }
  }, [engine]);

  const canUseLocalRender = useMemo(
    () => ((engine === 'mermaid' || engine === 'flowchart' || engine === 'graphviz') && format === 'svg'),
    [engine, format],
  );

  const showPreview = useMemo(() => {
    if (format === 'svg') {
      return Boolean(svg);
    }
    return Boolean(base64);
  }, [format, svg, base64]);

  const codeStats = useMemo(() => {
    const lines = code.split('\n').length;
    const chars = code.length;
    return { lines, chars };
  }, [code]);

  async function renderMermaidLocally(input: string): Promise<boolean> {
    try {
      const mermaid = await loadMermaid();
      if (!mermaid?.render) return false;
      const id = `mmd-${Date.now()}`;
      const result = await mermaid.render(id, input);
      if (result?.svg) {
        setContentType('image/svg+xml');
        setSvg(result.svg as string);
        setBase64('');
        return true;
      }
    } catch (err) {
      // ignore and let caller handle
    }
    return false;
  }

  async function renderGraphvizLocally(input: string): Promise<boolean> {
    try {
      const gv = await loadGraphviz();
      if (!gv?.layout) return false;
      const svgText = await gv.layout(input, 'svg', 'dot');
      if (svgText) {
        setContentType('image/svg+xml');
        setSvg(svgText as string);
        setBase64('');
        return true;
      }
    } catch (err) {
      // ignore and let caller handle
    }
    return false;
  }

  async function renderDiagram() {
    setLoading(true);
    setError('');
    setSvg('');
    setBase64('');
    try {
      if (abortRef.current) {
        abortRef.current.abort();
      }
      abortRef.current = new AbortController();
      const { signal } = abortRef.current;
      if (canUseLocalRender) {
        const ok = engine === 'graphviz' ? await renderGraphvizLocally(code) : await renderMermaidLocally(code);
        if (ok) {
          return;
        }
      }

      const res = await fetch('/api/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ engine, format, code }),
        signal,
      });
      if (!res.ok) {
        const j = await res.json().catch(() => null);
        const base = j?.error || '渲染失败';
        const statusText = j?.status ? `（HTTP ${j.status}）` : '';
        const detailsText = j?.details ? `：${String(j.details).slice(0, 120)}` : '';
        throw new Error(base + statusText + detailsText);
      }
      const data = await res.json();
      setContentType(data.contentType || '');
      if (data.svg) setSvg(data.svg);
      if (data.base64) setBase64(data.base64);
    } catch (e: any) {
      if (canUseLocalRender) {
        const ok = engine === 'graphviz' ? await renderGraphvizLocally(code) : await renderMermaidLocally(code);
        if (ok) {
          return;
        }
      }
      if (e?.name !== 'AbortError') {
        setError(e?.message || '渲染失败');
      }
    } finally {
      setLoading(false);
    }
  }

  async function downloadDiagram() {
    setError('');
    try {
      if (canUseLocalRender && svg) {
        const blob = new Blob([svg], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `diagram.${format}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        return;
      }
      if (abortRef.current) {
        abortRef.current.abort();
      }
      abortRef.current = new AbortController();
      const { signal } = abortRef.current;
      const res = await fetch('/api/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ engine, format, code, binary: true }),
        signal,
      });
      if (!res.ok) {
        const j = await res.json().catch(() => null);
        const base = j?.error || '下载失败';
        const statusText = j?.status ? `（HTTP ${j.status}）` : '';
        throw new Error(base + statusText);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `diagram.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      if (e?.name !== 'AbortError') {
        setError(e?.message || '下载失败');
      }
    }
  }

  async function copyShareLink() {
    setError('');
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

  useEffect(() => {
    return () => {
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
  }, []);

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
                onChange={(e) => setEngine(e.target.value as Engine)}
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
                onChange={(e) => setFormat(e.target.value as Format)}
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
              onClick={renderDiagram}
              disabled={loading || !code.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-600/40 transition hover:bg-sky-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? '渲染中…' : '渲染预览'}
            </button>
            <button
              type="button"
              onClick={downloadDiagram}
              disabled={!showPreview || loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-sky-400 hover:text-sky-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              下载文件
            </button>
            <button
              type="button"
              onClick={copyShareLink}
              disabled={!code.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-sky-400 hover:text-sky-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              复制分享链接
            </button>
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
              <button
                type="button"
                onClick={() => setCode(SAMPLES[engine])}
                className="text-xs font-medium text-sky-600 transition hover:text-sky-500"
              >
                恢复示例
              </button>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              className="min-h-[22rem] w-full resize-y rounded-2xl border border-slate-200 bg-slate-50/60 p-4 font-mono text-sm leading-6 text-slate-800 shadow-inner focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
              aria-label="图形代码编辑器"
            />
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
                <img src={`data:${contentType};base64,${base64}`} alt="diagram preview" className="mx-auto max-h-[30rem] w-auto max-w-full rounded-xl shadow" />
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
          <p className="text-xs text-slate-500">
            SVG 支持无限缩放，PNG 适合嵌入文档，PDF 便于打印与分享。
          </p>
        </div>
      </div>
    </main>
  );
}
