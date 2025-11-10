'use client';

import { useEffect, useState } from 'react';

type Engine = 'mermaid' | 'plantuml' | 'graphviz' | 'flowchart';
type Format = 'svg' | 'png' | 'pdf';

const SAMPLES: Record<Engine, string> = {
  mermaid: 'flowchart TD\nA[开始] --> B{条件?}\nB --是--> C[处理]\nB --否--> D[结束]',
  flowchart: 'flowchart TD\nA[Start] --> B{Is it?}\nB -- Yes --> C[OK]\nB -- No --> D[End]',
  graphviz: 'digraph G {\n  rankdir=LR;\n  A -> B -> C;\n  A -> D;\n}',
  plantuml: '@startuml\nstart\nif (条件?) then (是)\n  :处理;\nelse (否)\n  stop\nendif\n@enduml',
};

export default function Page() {
  const [engine, setEngine] = useState<Engine>('mermaid');
  const [format, setFormat] = useState<Format>('svg');
  const [code, setCode] = useState<string>(SAMPLES['mermaid']);
  const [svg, setSvg] = useState<string>('');
  const [base64, setBase64] = useState<string>('');
  const [contentType, setContentType] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    setCode(SAMPLES[engine]);
    setSvg('');
    setBase64('');
    setError('');
  }, [engine]);

  async function renderDiagram() {
    setLoading(true);
    setError('');
    setSvg('');
    setBase64('');
    try {
      const res = await fetch('/api/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ engine, format, code }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => null);
        throw new Error(j?.error || 'Render failed');
      }
      const data = await res.json();
      setContentType(data.contentType || '');
      if (data.svg) setSvg(data.svg);
      if (data.base64) setBase64(data.base64);
    } catch (e: any) {
      setError(e?.message || 'Error');
    } finally {
      setLoading(false);
    }
  }

  async function downloadDiagram() {
    setError('');
    try {
      const res = await fetch('/api/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ engine, format, code, binary: true }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => null);
        throw new Error(j?.error || 'Download failed');
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
      setError(e?.message || 'Error');
    }
  }

  const showPreview = format === 'svg' ? Boolean(svg) : Boolean(base64);

  return (
    <main className="mx-auto max-w-6xl p-4 md:p-8">
      <h1 className="text-2xl font-semibold mb-4">Graph Viewer</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="flex gap-3">
            <select value={engine} onChange={(e) => setEngine(e.target.value as Engine)} className="rounded border px-2 py-1">
              <option value="mermaid">mermaid</option>
              <option value="flowchart">flowchart</option>
              <option value="plantuml">plantuml</option>
              <option value="graphviz">graphviz</option>
            </select>
            <select value={format} onChange={(e) => setFormat(e.target.value as Format)} className="rounded border px-2 py-1">
              <option value="svg">svg</option>
              <option value="png">png</option>
              <option value="pdf">pdf</option>
            </select>
            <button onClick={renderDiagram} disabled={loading} className="rounded bg-blue-600 px-3 py-1 text-white disabled:opacity-60">
              {loading ? '渲染中...' : '渲染'}
            </button>
            <button onClick={downloadDiagram} className="rounded bg-gray-800 px-3 py-1 text-white">
              下载
            </button>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="h-80 w-full resize-y rounded border p-3 font-mono text-sm leading-5"
            spellCheck={false}
          />
          {error && <div className="text-red-600 text-sm">{error}</div>}
        </div>
        <div className="space-y-3">
          <div className="rounded border bg-white p-3">
            {!showPreview && <div className="text-gray-500 text-sm">暂无预览</div>}
            {format === 'svg' && svg && (
              <div className="overflow-auto" dangerouslySetInnerHTML={{ __html: svg }} />
            )}
            {format === 'png' && base64 && (
              <img src={`data:${contentType};base64,${base64}`} alt="preview" className="max-w-full" />
            )}
            {format === 'pdf' && base64 && (
              <iframe src={`data:application/pdf;base64,${base64}`} className="w-full h-[600px]" />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
