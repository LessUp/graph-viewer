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
  linkError: string;
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
  const [linkError, setLinkError] = useState<string>('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const params = new URLSearchParams(window.location.search);
      const qsEngine = params.get('engine');
      const qsFormat = params.get('format');
      const qsCode = params.get('code');
      const qsEncoded = params.get('encoded');
      let appliedFromQuery = false;

      if (qsEngine) {
        if (isEngine(qsEngine)) {
          setEngine(qsEngine);
          appliedFromQuery = true;
        } else {
          setLinkError('分享链接中的引擎参数无效，已使用默认引擎。');
        }
      }
      if (qsFormat) {
        if (isFormat(qsFormat)) {
          setFormat(qsFormat);
          appliedFromQuery = true;
        } else {
          setLinkError((prev: string) =>
            prev || '分享链接中的格式参数无效，已使用默认格式。',
          );
        }
      }
      if (qsCode !== null) {
        if (qsEncoded === '1') {
          let codeFromQuery = qsCode;
          try {
            const decompressed = decompressFromEncodedURIComponent(qsCode);
            if (typeof decompressed === 'string' && decompressed.length > 0) {
              codeFromQuery = decompressed;
            } else {
              setLinkError((prev: string) =>
                prev || '分享链接中的代码解压后为空，已使用原始内容。',
              );
            }
          } catch {
            setLinkError((prev: string) =>
              prev || '分享链接中的代码解压失败，已使用原始内容。',
            );
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
    linkError,
    setEngine,
    setFormat,
    setCode,
  };
}
