import { useEffect, useMemo, useState } from 'react';
import { decompressFromEncodedURIComponent } from 'lz-string';
import type { Engine, Format } from '@/lib/diagramConfig';
import { isEngine, isFormat } from '@/lib/diagramConfig';

const LOCAL_STORAGE_KEY = 'graphviewer:state:v1';

type DiagramDoc = {
  id: string;
  name: string;
  engine: Engine;
  format: Format;
  code: string;
  updatedAt: string;
};

type DiagramState = {
  engine: Engine;
  format: Format;
  code: string;
  codeStats: { lines: number; chars: number };
  linkError: string;
  diagrams: DiagramDoc[];
  currentId: string;
};

type DiagramStateControls = {
  setEngine: (engine: Engine) => void;
  setFormat: (format: Format) => void;
  setCode: (code: string) => void;
  setCurrentId: (id: string) => void;
  createDiagram: () => void;
  renameDiagram: (id: string, name: string) => void;
  deleteDiagram: (id: string) => void;
};

function generateDiagramId(): string {
  return `d-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useDiagramState(initialCode: string): DiagramState & DiagramStateControls {
  const [engine, setEngine] = useState<Engine>('mermaid');
  const [format, setFormat] = useState<Format>('svg');
  const [code, setCode] = useState<string>(initialCode);
  const [linkError, setLinkError] = useState<string>('');
  const [diagrams, setDiagrams] = useState<DiagramDoc[]>([]);
  const [currentId, setCurrentId] = useState<string>('');

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
      const parsed = JSON.parse(raw) as {
        engine?: string;
        format?: string;
        code?: string;
        diagrams?: DiagramDoc[];
        currentId?: string;
      };
      if (parsed.engine && isEngine(parsed.engine)) {
        setEngine(parsed.engine);
      }
      if (parsed.format && isFormat(parsed.format)) {
        setFormat(parsed.format);
      }
      if (typeof parsed.code === 'string') {
        setCode(parsed.code);
      }
      if (Array.isArray(parsed.diagrams) && parsed.diagrams.length > 0) {
        setDiagrams(parsed.diagrams);
        const nextId =
          parsed.currentId && parsed.diagrams.some((d: DiagramDoc) => d.id === parsed.currentId)
            ? parsed.currentId
            : parsed.diagrams[0].id;
        setCurrentId(nextId);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!diagrams.length && !currentId) {
      const id = generateDiagramId();
      const now = new Date().toISOString();
      const name = '未命名图 1';
      const first: DiagramDoc = {
        id,
        name,
        engine,
        format,
        code,
        updatedAt: now,
      };
      setDiagrams([first]);
      setCurrentId(id);
      return;
    }

    if (!currentId && diagrams.length > 0) {
      setCurrentId(diagrams[0].id);
      return;
    }

    if (!currentId) return;

    const idx = diagrams.findIndex((d: DiagramDoc) => d.id === currentId);
    const now = new Date().toISOString();

    if (idx === -1) {
      const name = `未命名图 ${diagrams.length + 1}`;
      const doc: DiagramDoc = {
        id: currentId,
        name,
        engine,
        format,
        code,
        updatedAt: now,
      };
      setDiagrams([...diagrams, doc]);
      return;
    }

    const current = diagrams[idx];
    if (
      current.engine !== engine ||
      current.format !== format ||
      current.code !== code
    ) {
      const next = diagrams.slice();
      next[idx] = {
        ...current,
        engine,
        format,
        code,
        updatedAt: now,
      };
      setDiagrams(next);
    }
  }, [engine, format, code, currentId, diagrams]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const payload = JSON.stringify({ engine, format, code, diagrams, currentId });
      window.localStorage.setItem(LOCAL_STORAGE_KEY, payload);
    } catch {
      // ignore
    }
  }, [engine, format, code, diagrams, currentId]);

  const codeStats = useMemo(() => {
    const lines = code.split('\n').length;
    const chars = code.length;
    return { lines, chars };
  }, [code]);

  const handleSetCurrentId = (id: string) => {
    if (!id) return;
    const found = diagrams.find((d: DiagramDoc) => d.id === id);
    setCurrentId(id);
    if (found) {
      setEngine(found.engine);
      setFormat(found.format);
      setCode(found.code);
    }
  };

  const createDiagram = () => {
    const id = generateDiagramId();
    const now = new Date().toISOString();
    const name = `未命名图 ${diagrams.length + 1}`;
    const doc: DiagramDoc = {
      id,
      name,
      engine,
      format,
      code: '',
      updatedAt: now,
    };
    setDiagrams([...diagrams, doc]);
    setCurrentId(id);
    setCode('');
  };

  const renameDiagram = (id: string, name: string) => {
    if (!id) return;
    setDiagrams((prev: DiagramDoc[]) => {
      const next = prev.slice();
      const idx = next.findIndex((d: DiagramDoc) => d.id === id);
      if (idx === -1) return prev;
      const n = name && name.trim().length > 0 ? name.trim() : next[idx].name;
      next[idx] = { ...next[idx], name: n, updatedAt: new Date().toISOString() };
      return next;
    });
  };

  const deleteDiagram = (id: string) => {
    if (!id) return;
    setDiagrams((prev: DiagramDoc[]) => {
      const idx = prev.findIndex((d: DiagramDoc) => d.id === id);
      if (idx === -1) return prev;
      const next = [...prev.slice(0, idx), ...prev.slice(idx + 1)];

      // If deleting a non-current diagram, just return the new list.
      if (id !== currentId) {
        return next;
      }

      // Deleted the current diagram.
      if (next.length === 0) {
        const newId = generateDiagramId();
        const now = new Date().toISOString();
        const doc: DiagramDoc = {
          id: newId,
          name: '未命名图 1',
          engine: 'mermaid',
          format: 'svg',
          code: '',
          updatedAt: now,
        };
        setEngine('mermaid');
        setFormat('svg');
        setCode('');
        setCurrentId(newId);
        return [doc];
      }

      const fallbackIndex = idx - 1 >= 0 ? idx - 1 : 0;
      const fallback = next[fallbackIndex];
      setCurrentId(fallback.id);
      setEngine(fallback.engine);
      setFormat(fallback.format);
      setCode(fallback.code);
      return next;
    });
  };

  return {
    engine,
    format,
    code,
    codeStats,
    linkError,
    diagrams,
    currentId,
    setEngine,
    setFormat,
    setCode,
    setCurrentId: handleSetCurrentId,
    createDiagram,
    renameDiagram,
     deleteDiagram,
  };
}
