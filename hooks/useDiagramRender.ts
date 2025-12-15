import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Engine, Format } from '@/lib/diagramConfig';
import { canUseLocalRender as canUseLocalRenderConfig } from '@/lib/diagramConfig';

const GRAPHVIZ_WASM_BASE_URL =
  process.env.NEXT_PUBLIC_GRAPHVIZ_WASM_BASE_URL || 'https://cdn.jsdelivr.net/npm/@hpcc-js/wasm/dist';

let mermaidPromise: Promise<any> | null = null;
let graphvizPromise: Promise<any> | null = null;

async function loadMermaid() {
  if (!mermaidPromise) {
    mermaidPromise = import('mermaid')
      .then((module) => {
        const mermaid = module?.default ?? module;
        if (mermaid?.initialize) {
          mermaid.initialize({ startOnLoad: false, theme: 'neutral', securityLevel: 'strict' });
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
          g.wasmFolder(GRAPHVIZ_WASM_BASE_URL);
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

async function renderMermaidLocally(
  input: string,
  setContentType: (v: string) => void,
  setSvg: (v: string) => void,
  setBase64: (v: string) => void,
): Promise<boolean> {
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
  } catch {
    // ignore and let caller handle
  }
  return false;
}

async function renderGraphvizLocally(
  input: string,
  setContentType: (v: string) => void,
  setSvg: (v: string) => void,
  setBase64: (v: string) => void,
): Promise<boolean> {
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
  } catch {
    // ignore and let caller handle
  }
  return false;
}

export type UseDiagramRenderResult = {
  svg: string;
  base64: string;
  contentType: string;
  loading: boolean;
  error: string;
  canUseLocalRender: boolean;
  showPreview: boolean;
  renderDiagram: () => Promise<void>;
  downloadDiagram: () => Promise<void>;
  clearError: () => void;
  setError: (message: string) => void;
  resetOutput: () => void;
};

export function useDiagramRender(engine: Engine, format: Format, code: string): UseDiagramRenderResult {
  const [svg, setSvg] = useState<string>('');
  const [base64, setBase64] = useState<string>('');
  const [contentType, setContentType] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setErrorState] = useState<string>('');
  const abortRef = useRef<AbortController | null>(null);

  const canUseLocalRender = useMemo(
    () => canUseLocalRenderConfig(engine, format),
    [engine, format],
  );

  const showPreview = useMemo(() => {
    if (format === 'svg') {
      return Boolean(svg);
    }
    return Boolean(base64);
  }, [format, svg, base64]);

  useEffect(() => {
    if (engine === 'mermaid' || engine === 'flowchart') {
      loadMermaid().catch(() => undefined);
    }
    if (engine === 'graphviz') {
      loadGraphviz().catch(() => undefined);
    }
  }, [engine]);

  useEffect(() => {
    return () => {
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
  }, []);

  const resetOutput = useCallback(() => {
    setSvg('');
    setBase64('');
    setContentType('');
  }, []);

  const clearError = useCallback(() => {
    setErrorState('');
  }, []);

  const setError = useCallback((message: string) => {
    setErrorState(message);
  }, []);

  const renderDiagram = useCallback(async () => {
    setLoading(true);
    setErrorState('');
    resetOutput();
    try {
      if (abortRef.current) {
        abortRef.current.abort();
      }
      abortRef.current = new AbortController();
      const { signal } = abortRef.current;

      if (canUseLocalRender) {
        const ok = engine === 'graphviz'
          ? await renderGraphvizLocally(code, setContentType, setSvg, setBase64)
          : await renderMermaidLocally(code, setContentType, setSvg, setBase64);
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
        let base = '渲染失败';
        const codeValue = j?.code;
        if (codeValue === 'KROKI_TIMEOUT') {
          base = '远程渲染服务超时，请稍后重试或检查网络连接。';
        } else if (codeValue === 'KROKI_NETWORK_ERROR') {
          base = '无法连接远程渲染服务，可能是网络问题或访问被拦截。';
        } else if (codeValue === 'KROKI_ERROR') {
          base = '远程渲染服务渲染失败，可能是图形代码有误。';
        } else if (typeof j?.error === 'string' && j.error) {
          base = j.error;
        }
        const httpStatus = res.status;
        const krokiStatus = typeof j?.status === 'number' ? j.status : null;
        const statusText = `（HTTP ${httpStatus}${krokiStatus ? ` / Kroki ${krokiStatus}` : ''}）`;
        const detailsText =
          codeValue === 'PAYLOAD_TOO_LARGE' && j?.maxLength
            ? `：输入过长，最大允许 ${j.maxLength} 字符`
            : j?.details
              ? `：${String(j.details).slice(0, 120)}`
              : j?.message
                ? `：${String(j.message).slice(0, 120)}`
                : '';
        throw new Error(base + statusText + detailsText);
      }
      const data = await res.json();
      setContentType(data.contentType || '');
      if (data.svg) setSvg(data.svg);
      if (data.base64) setBase64(data.base64);
    } catch (e: any) {
      if (canUseLocalRender) {
        const ok = engine === 'graphviz'
          ? await renderGraphvizLocally(code, setContentType, setSvg, setBase64)
          : await renderMermaidLocally(code, setContentType, setSvg, setBase64);
        if (ok) {
          return;
        }
      }
      if (e?.name !== 'AbortError') {
        setErrorState(e?.message || '渲染失败');
      }
    } finally {
      setLoading(false);
    }
  }, [canUseLocalRender, code, engine, format, resetOutput]);

  const downloadDiagram = useCallback(async () => {
    setErrorState('');
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
        let base = '下载失败';
        const codeValue = j?.code;
        if (codeValue === 'KROKI_TIMEOUT') {
          base = '远程渲染服务超时，无法下载文件，请稍后重试或检查网络连接。';
        } else if (codeValue === 'KROKI_NETWORK_ERROR') {
          base = '无法连接远程渲染服务，下载失败，可能是网络问题或访问被拦截。';
        } else if (codeValue === 'KROKI_ERROR') {
          base = '远程渲染服务渲染失败，无法生成可下载文件，请检查图形代码。';
        } else if (typeof j?.error === 'string' && j.error) {
          base = j.error;
        }
        const httpStatus = res.status;
        const krokiStatus = typeof j?.status === 'number' ? j.status : null;
        const statusText = `（HTTP ${httpStatus}${krokiStatus ? ` / Kroki ${krokiStatus}` : ''}）`;
        const detailsText =
          codeValue === 'PAYLOAD_TOO_LARGE' && j?.maxLength
            ? `：输入过长，最大允许 ${j.maxLength} 字符`
            : j?.details
              ? `：${String(j.details).slice(0, 120)}`
              : j?.message
                ? `：${String(j.message).slice(0, 120)}`
                : '';
        throw new Error(base + statusText + detailsText);
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
        setErrorState(e?.message || '下载失败');
      }
    }
  }, [canUseLocalRender, code, engine, format, svg]);

  return {
    svg,
    base64,
    contentType,
    loading,
    error: error,
    canUseLocalRender,
    showPreview,
    renderDiagram,
    downloadDiagram,
    clearError,
    setError,
    resetOutput,
  };
}
