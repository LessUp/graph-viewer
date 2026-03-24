import { useCallback, useEffect, useMemo, useState } from 'react';
import { decompressFromEncodedURIComponent } from 'lz-string';
import type { Engine, Format } from '@/lib/diagramConfig';
import { isEngine, isFormat } from '@/lib/diagramConfig';
import type { DiagramDoc } from '@/lib/types';

const LOCAL_STORAGE_KEY = 'graphviewer:state:v1';
const STORAGE_WRITE_DEBOUNCE_MS = 250;

type DiagramState = {
  engine: Engine;
  format: Format;
  code: string;
  codeStats: { lines: number; chars: number };
  linkError: string;
  diagrams: DiagramDoc[];
  currentId: string;
  hasHydrated: boolean;
};

type DiagramStateControls = {
  setEngine: (engine: Engine) => void;
  setFormat: (format: Format) => void;
  setCode: (code: string) => void;
  setCurrentId: (id: string) => void;
  createDiagram: (defaultCode?: string) => void;
  renameDiagram: (id: string, name: string) => void;
  deleteDiagram: (id: string) => void;
  importWorkspace: (payload: { diagrams: Record<string, unknown>[]; currentId?: string }) => void;
};

type PersistedWorkspace = {
  diagrams?: DiagramDoc[];
  currentId?: string;
  engine?: string;
  format?: string;
  code?: string;
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
  const [hasHydrated, setHasHydrated] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      setHasHydrated(true);
      return;
    }

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
          setLinkError((prev: string) => prev || '分享链接中的格式参数无效，已使用默认格式。');
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
              setLinkError((prev: string) => prev || '分享链接中的代码解压后为空，已使用原始内容。');
            }
          } catch {
            setLinkError((prev: string) => prev || '分享链接中的代码解压失败，已使用原始内容。');
          }
          setCode(codeFromQuery);
        } else {
          setCode(qsCode);
        }
        appliedFromQuery = true;
      }

      const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw) as PersistedWorkspace;
      if (Array.isArray(parsed.diagrams) && parsed.diagrams.length > 0) {
        setDiagrams(parsed.diagrams);
        const nextId =
          parsed.currentId && parsed.diagrams.some((d: DiagramDoc) => d.id === parsed.currentId)
            ? parsed.currentId
            : parsed.diagrams[0].id;
        setCurrentId(nextId);

        if (!appliedFromQuery) {
          const currentDiagram = parsed.diagrams.find((d: DiagramDoc) => d.id === nextId) ?? parsed.diagrams[0];
          setEngine(currentDiagram.engine);
          setFormat(currentDiagram.format);
          setCode(currentDiagram.code);
        }
        return;
      }

      if (!appliedFromQuery) {
        if (parsed.engine && isEngine(parsed.engine)) {
          setEngine(parsed.engine);
        }
        if (parsed.format && isFormat(parsed.format)) {
          setFormat(parsed.format);
        }
        if (typeof parsed.code === 'string') {
          setCode(parsed.code);
        }
      }
    } catch {
      // ignore
    } finally {
      setHasHydrated(true);
    }
  }, []);

  // 同步当前编辑状态到 diagrams，避免顶层状态和工作区文档重复漂移
  useEffect(() => {
    if (!hasHydrated) return;

    setDiagrams((prev) => {
      if (!prev.length && !currentId) {
        const id = generateDiagramId();
        const doc: DiagramDoc = {
          id,
          name: '未命名图 1',
          engine,
          format,
          code,
          updatedAt: new Date().toISOString(),
        };
        setCurrentId(id);
        return [doc];
      }

      if (!currentId) {
        if (prev.length > 0) {
          setCurrentId(prev[0].id);
        }
        return prev;
      }

      const idx = prev.findIndex((d) => d.id === currentId);
      if (idx === -1) {
        const doc: DiagramDoc = {
          id: currentId,
          name: `未命名图 ${prev.length + 1}`,
          engine,
          format,
          code,
          updatedAt: new Date().toISOString(),
        };
        return [...prev, doc];
      }

      const current = prev[idx];
      if (current.engine === engine && current.format === format && current.code === code) {
        return prev;
      }

      const next = prev.slice();
      next[idx] = { ...current, engine, format, code, updatedAt: new Date().toISOString() };
      return next;
    });
  }, [engine, format, code, currentId, hasHydrated]);

  // 仅持久化 diagrams/currentId，避免与顶层 engine/format/code 重复写入
  useEffect(() => {
    if (typeof window === 'undefined' || !hasHydrated) return;

    const timer = window.setTimeout(() => {
      try {
        window.localStorage.setItem(
          LOCAL_STORAGE_KEY,
          JSON.stringify({
            diagrams,
            currentId,
          }),
        );
      } catch {
        // ignore
      }
    }, STORAGE_WRITE_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [diagrams, currentId, hasHydrated]);

  const codeStats = useMemo(() => {
    const lines = code.split('\n').length;
    const chars = code.length;
    return { lines, chars };
  }, [code]);

  const handleSetCurrentId = useCallback((id: string) => {
    if (!id) return;
    setDiagrams((prev) => {
      const found = prev.find((d) => d.id === id);
      if (found) {
        setCurrentId(id);
        setEngine(found.engine);
        setFormat(found.format);
        setCode(found.code);
      }
      return prev;
    });
  }, []);

  const createDiagram = useCallback(
    (defaultCode?: string) => {
      const id = generateDiagramId();
      const now = new Date().toISOString();
      const newCode = defaultCode ?? '';
      setDiagrams((prev) => {
        const name = `未命名图 ${prev.length + 1}`;
        const doc: DiagramDoc = {
          id,
          name,
          engine,
          format,
          code: newCode,
          updatedAt: now,
        };
        return [...prev, doc];
      });
      setCurrentId(id);
      setCode(newCode);
    },
    [engine, format],
  );

  const renameDiagram = useCallback((id: string, name: string) => {
    if (!id) return;
    setDiagrams((prev) => {
      const next = prev.slice();
      const idx = next.findIndex((d) => d.id === id);
      if (idx === -1) return prev;
      const n = name && name.trim().length > 0 ? name.trim() : next[idx].name;
      next[idx] = { ...next[idx], name: n, updatedAt: new Date().toISOString() };
      return next;
    });
  }, []);

  const importWorkspace = useCallback(
    (payload: { diagrams: Record<string, unknown>[]; currentId?: string }) => {
      const raw = Array.isArray(payload?.diagrams) ? payload.diagrams : [];
      if (!raw.length) return;

      const list: DiagramDoc[] = raw
        .filter(
          (d): d is Record<string, unknown> & { id: string; name: string; code: string } =>
            typeof d?.id === 'string' && typeof d?.name === 'string' && typeof d?.code === 'string',
        )
        .map((d) => ({
          id: d.id,
          name: d.name,
          engine: isEngine(d.engine) ? d.engine : 'mermaid',
          format: isFormat(d.format) ? d.format : 'svg',
          code: d.code,
          updatedAt: typeof d.updatedAt === 'string' ? d.updatedAt : new Date().toISOString(),
        }));

      if (!list.length) return;

      setDiagrams(list);
      const hasCurrent = payload.currentId && list.some((d) => d.id === payload.currentId);
      const nextId = hasCurrent ? (payload.currentId as string) : list[0].id;
      const nextDoc = list.find((d) => d.id === nextId) ?? list[0];
      setCurrentId(nextDoc.id);
      setEngine(nextDoc.engine);
      setFormat(nextDoc.format);
      setCode(nextDoc.code);
    },
    [],
  );

  const deleteDiagram = useCallback(
    (id: string) => {
      if (!id) return;
      setDiagrams((prev) => {
        const idx = prev.findIndex((d) => d.id === id);
        if (idx === -1) return prev;
        const next = [...prev.slice(0, idx), ...prev.slice(idx + 1)];

        if (id !== currentId) {
          return next;
        }

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
    },
    [currentId],
  );

  return {
    engine,
    format,
    code,
    codeStats,
    linkError,
    diagrams,
    currentId,
    hasHydrated,
    setEngine,
    setFormat,
    setCode,
    setCurrentId: handleSetCurrentId,
    createDiagram,
    renameDiagram,
    deleteDiagram,
    importWorkspace,
  };
}
