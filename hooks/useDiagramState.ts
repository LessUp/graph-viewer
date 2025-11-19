import { useEffect, useMemo, useState } from 'react';
import { decompressFromEncodedURIComponent } from 'lz-string';
import type { Engine, Format } from '@/lib/diagramConfig';
import { isEngine, isFormat } from '@/lib/diagramConfig';

const LOCAL_STORAGE_KEY = 'graphviewer:state:v1';

type DiagramState = {
  engine: Engine;
  format: Format;
  code: string;
  codeStats: { lines: number; chars: number };
};

type DiagramStateControls = {
  setEngine: (engine: Engine) => void;
  setFormat: (format: Format) => void;
  setCode: (code: string) => void;
};

export function useDiagramState(initialCode: string): DiagramState & DiagramStateControls {
  const [engine, setEngine] = useState<Engine>('mermaid');
  const [format, setFormat] = useState<Format>('svg');
  const [code, setCode] = useState<string>(initialCode);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const params = new URLSearchParams(window.location.search);
      const qsEngine = params.get('engine');
      const qsFormat = params.get('format');
      const qsCode = params.get('code');
      const qsEncoded = params.get('encoded');
      let appliedFromQuery = false;

      if (qsEngine && isEngine(qsEngine)) {
        setEngine(qsEngine);
        appliedFromQuery = true;
      }
      if (qsFormat && isFormat(qsFormat)) {
        setFormat(qsFormat);
        appliedFromQuery = true;
      }
      if (qsCode !== null) {
        if (qsEncoded === '1') {
          let codeFromQuery = qsCode;
          try {
            const decompressed = decompressFromEncodedURIComponent(qsCode);
            if (typeof decompressed === 'string' && decompressed.length > 0) {
              codeFromQuery = decompressed;
            }
          } catch {
            // ignore and fall back to raw code
          }
          setCode(codeFromQuery);
        } else {
          setCode(qsCode);
        }
        appliedFromQuery = true;
      }
      if (appliedFromQuery) return;

      const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { engine?: string; format?: string; code?: string };
      if (parsed.engine && isEngine(parsed.engine)) {
        setEngine(parsed.engine);
      }
      if (parsed.format && isFormat(parsed.format)) {
        setFormat(parsed.format);
      }
      if (typeof parsed.code === 'string') {
        setCode(parsed.code);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const payload = JSON.stringify({ engine, format, code });
      window.localStorage.setItem(LOCAL_STORAGE_KEY, payload);
    } catch {
      // ignore
    }
  }, [engine, format, code]);

  const codeStats = useMemo(() => {
    const lines = code.split('\n').length;
    const chars = code.length;
    return { lines, chars };
  }, [code]);

  return {
    engine,
    format,
    code,
    codeStats,
    setEngine,
    setFormat,
    setCode,
  };
}
