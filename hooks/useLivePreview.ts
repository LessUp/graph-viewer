import { useEffect, useRef, useState } from 'react';
import type { Engine } from '@/lib/diagramConfig';

type LivePreviewDeps = {
  engine: Engine;
  code: string;
  debounceMs: number;
  renderDiagram: () => Promise<void> | void;
  resetOutput: () => void;
};

export function useLivePreview(deps: LivePreviewDeps) {
  const { engine, code, debounceMs, renderDiagram, resetOutput } = deps;
  const [livePreview, setLivePreview] = useState(true);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    if (!livePreview) {
      if (debounceRef.current !== null) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
      return;
    }
    if (!code.trim()) {
      resetOutput();
      return;
    }
    if (debounceRef.current !== null) clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => void renderDiagram(), debounceMs);
    return () => {
      if (debounceRef.current !== null) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    };
  }, [livePreview, engine, code, debounceMs, renderDiagram, resetOutput]);

  return { livePreview, setLivePreview };
}
