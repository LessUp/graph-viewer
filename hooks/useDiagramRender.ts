import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Engine, Format } from '@/lib/diagramConfig';
import { canUseLocalRender as canUseLocalRenderConfig } from '@/lib/diagramConfig';
import { logger } from '@/lib/logger';

const GRAPHVIZ_WASM_BASE_URL =
  process.env.NEXT_PUBLIC_GRAPHVIZ_WASM_BASE_URL ||
  'https://cdn.jsdelivr.net/npm/@hpcc-js/wasm/dist';

type MermaidApi = {
  initialize?: (cfg: Record<string, unknown>) => void;
  render: (id: string, code: string) => Promise<{ svg: string }>;
};
type GraphvizApi = {
  wasmFolder?: (url: string) => void;
  load?: () => Promise<void>;
  layout: (code: string, format: string, engine: string) => Promise<string>;
};

type RenderOutputState = {
  contentType: string;
  svg: string;
  base64: string;
};

const EMPTY_OUTPUT: RenderOutputState = {
  contentType: '',
  svg: '',
  base64: '',
};

let mermaidPromise: Promise<MermaidApi> | null = null;
let graphvizPromise: Promise<GraphvizApi> | null = null;

async function loadMermaid() {
  if (!mermaidPromise) {
    mermaidPromise = import('mermaid')
      .then((module) => {
        const mermaid = (module?.default ?? module) as MermaidApi;
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
        const mod = module as Record<string, unknown>;
        const g = (mod.graphviz ?? module) as GraphvizApi;
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

async function renderMermaidLocally(input: string): Promise<RenderOutputState | null> {
  try {
    const mermaid = await loadMermaid();
    if (!mermaid?.render) return null;
    const id = `mmd-${Date.now()}`;
    const result = await mermaid.render(id, input);
    if (result?.svg) {
      return {
        contentType: 'image/svg+xml',
        svg: result.svg as string,
        base64: '',
      };
    }
  } catch (e: unknown) {
    logger.warn('render-mermaid-local', {
      error: e instanceof Error ? e.message : 'Unknown error',
    });
  }
  return null;
}

async function renderGraphvizLocally(input: string): Promise<RenderOutputState | null> {
  try {
    const gv = await loadGraphviz();
    if (!gv?.layout) return null;
    const svgText = await gv.layout(input, 'svg', 'dot');
    if (svgText) {
      return {
        contentType: 'image/svg+xml',
        svg: svgText as string,
        base64: '',
      };
    }
  } catch (e: unknown) {
    logger.warn('render-graphviz-local', {
      error: e instanceof Error ? e.message : 'Unknown error',
    });
  }
  return null;
}

function triggerFileDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function buildApiErrorMessage(
  res: Response,
  json: Record<string, unknown> | null,
  defaultMsg: string,
): string {
  const j = json;
  let base = defaultMsg;
  const codeValue = j?.code;
  if (codeValue === 'KROKI_TIMEOUT') {
    base = '远程渲染服务超时，请稍后重试或检查网络连接。';
  } else if (codeValue === 'KROKI_NETWORK_ERROR') {
    base = '无法连接远程渲染服务，可能是网络问题或访问被拦截。';
  } else if (codeValue === 'KROKI_ERROR') {
    base = '远程渲染服务渲染失败，可能是图形代码有误。';
  } else if (typeof j?.error === 'string' && j.error) {
    base = j.error as string;
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
  return base + statusText + detailsText;
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

export function useDiagramRender(
  engine: Engine,
  format: Format,
  code: string,
  krokiBaseUrl?: string,
  remoteRenderingEnabled = true,
): UseDiagramRenderResult {
  const [output, setOutput] = useState<RenderOutputState>(EMPTY_OUTPUT);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setErrorState] = useState<string>('');
  const abortRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  const canUseLocalRender = useMemo(
    () => canUseLocalRenderConfig(engine, format),
    [engine, format],
  );

  const showPreview = useMemo(() => {
    if (format === 'svg') {
      return Boolean(output.svg);
    }
    return Boolean(output.base64);
  }, [format, output]);

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
    setOutput(EMPTY_OUTPUT);
  }, []);

  const clearError = useCallback(() => {
    setErrorState('');
  }, []);

  const setError = useCallback((message: string) => {
    setErrorState(message);
  }, []);

  const applyOutputIfLatest = useCallback((requestId: number, nextOutput: RenderOutputState) => {
    if (requestIdRef.current === requestId) {
      setOutput(nextOutput);
    }
  }, []);

  const tryLocalRender = useCallback(async (): Promise<RenderOutputState | null> => {
    if (!canUseLocalRender) return null;
    return engine === 'graphviz' ? renderGraphvizLocally(code) : renderMermaidLocally(code);
  }, [canUseLocalRender, code, engine]);

  const renderDiagram = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setErrorState('');
    resetOutput();

    try {
      if (abortRef.current) {
        abortRef.current.abort();
      }
      abortRef.current = new AbortController();
      const { signal } = abortRef.current;

      const localResult = await tryLocalRender();
      if (localResult) {
        applyOutputIfLatest(requestId, localResult);
        return;
      }

      if (!remoteRenderingEnabled) {
        throw new Error(
          '当前静态部署模式下不可用该渲染方式，请切换到 SVG 本地渲染或使用完整服务部署。',
        );
      }

      const payload: Record<string, unknown> = { engine, format, code };
      const customBaseUrl = typeof krokiBaseUrl === 'string' ? krokiBaseUrl.trim() : '';
      if (customBaseUrl) {
        payload.krokiBaseUrl = customBaseUrl;
      }

      const res = await fetch('/api/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal,
      });
      if (!res.ok) {
        const j = await res.json().catch(() => null);
        throw new Error(buildApiErrorMessage(res, j, '渲染失败'));
      }
      const data = (await res.json()) as {
        contentType?: string;
        svg?: string;
        base64?: string;
      };
      applyOutputIfLatest(requestId, {
        contentType: data.contentType || '',
        svg: data.svg || '',
        base64: data.base64 || '',
      });
    } catch (e: unknown) {
      if (e instanceof Error && e.name === 'AbortError') {
        return;
      }
      if (requestIdRef.current === requestId) {
        setErrorState(e instanceof Error ? e.message || '渲染失败' : '渲染失败');
      }
    } finally {
      if (requestIdRef.current === requestId) {
        setLoading(false);
      }
    }
  }, [
    applyOutputIfLatest,
    code,
    engine,
    format,
    krokiBaseUrl,
    remoteRenderingEnabled,
    resetOutput,
    tryLocalRender,
  ]);

  const downloadDiagram = useCallback(async () => {
    setErrorState('');
    try {
      if (canUseLocalRender && output.svg) {
        triggerFileDownload(new Blob([output.svg], { type: 'image/svg+xml' }), `diagram.${format}`);
        return;
      }
      if (abortRef.current) {
        abortRef.current.abort();
      }
      abortRef.current = new AbortController();
      const { signal } = abortRef.current;

      if (!remoteRenderingEnabled) {
        throw new Error('当前静态部署模式下不可下载该渲染格式，请使用完整服务部署。');
      }

      const payload: Record<string, unknown> = { engine, format, code, binary: true };
      const customBaseUrl = typeof krokiBaseUrl === 'string' ? krokiBaseUrl.trim() : '';
      if (customBaseUrl) {
        payload.krokiBaseUrl = customBaseUrl;
      }

      const res = await fetch('/api/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal,
      });
      if (!res.ok) {
        const j = await res.json().catch(() => null);
        throw new Error(buildApiErrorMessage(res, j, '下载失败'));
      }
      const blob = await res.blob();
      triggerFileDownload(blob, `diagram.${format}`);
    } catch (e: unknown) {
      if (e instanceof Error && e.name === 'AbortError') {
        return;
      }
      setErrorState(e instanceof Error ? e.message || '下载失败' : '下载失败');
    }
  }, [canUseLocalRender, code, engine, format, krokiBaseUrl, output.svg, remoteRenderingEnabled]);

  return {
    svg: output.svg,
    base64: output.base64,
    contentType: output.contentType,
    loading,
    error,
    canUseLocalRender,
    showPreview,
    renderDiagram,
    downloadDiagram,
    clearError,
    setError,
    resetOutput,
  };
}
