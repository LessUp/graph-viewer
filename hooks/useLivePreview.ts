import { useEffect, useRef, useState } from 'react';
import type { Engine } from '@/lib/diagramConfig';
import { isAbortError } from '@/lib/errorUtils';
import { logger } from '@/lib/logger';

type LivePreviewDeps = {
  engine: Engine;
  code: string;
  debounceMs: number;
  renderDiagram: (signal?: AbortSignal) => Promise<void> | void;
  resetOutput: () => void;
};

export function useLivePreview(deps: LivePreviewDeps) {
  const { engine, code, debounceMs, renderDiagram, resetOutput } = deps;
  const [livePreview, setLivePreview] = useState(true);
  const debounceRef = useRef<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!livePreview) {
      if (debounceRef.current !== null) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
      // 取消正在进行的渲染
      abortControllerRef.current?.abort();
      return;
    }
    if (!code.trim()) {
      resetOutput();
      return;
    }
    if (debounceRef.current !== null) clearTimeout(debounceRef.current);

    // 创建新的 AbortController 用于取消本次渲染
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    debounceRef.current = window.setTimeout(async () => {
      try {
        await renderDiagram(signal);
      } catch (e: unknown) {
        // 忽略取消错误
        if (isAbortError(e)) return;
        logger.warn('live-preview', { error: e instanceof Error ? e.message : 'Unknown error' });
      }
    }, debounceMs);

    return () => {
      if (debounceRef.current !== null) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
      // 组件卸载时取消渲染
      abortControllerRef.current?.abort();
    };
  }, [livePreview, engine, code, debounceMs, renderDiagram, resetOutput]);

  return { livePreview, setLivePreview };
}
