import { useCallback } from 'react';
import type { Engine } from '@/lib/diagramConfig';
import type { DiagramDoc } from '@/lib/types';
import { SAMPLES } from '@/lib/diagramSamples';

type WorkspaceActionsDeps = {
  engine: Engine;
  code: string;
  currentId: string;
  diagrams: DiagramDoc[];
  setCode: (code: string) => void;
  setEngine: (engine: Engine) => void;
  resetOutput: () => void;
  createDiagram: (code: string) => void;
  renameDiagram: (id: string, name: string) => void;
  deleteDiagram: (id: string) => void;
  setCurrentId: (id: string) => void;
  clearError: () => void;
  setError: (msg: string) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
};

export function useWorkspaceActions(deps: WorkspaceActionsDeps) {
  const {
    engine, code, currentId, diagrams,
    setCode, setEngine, resetOutput,
    createDiagram, renameDiagram, deleteDiagram, setCurrentId,
    clearError, setError, showToast,
  } = deps;

  const handleCopyCode = useCallback(async () => {
    clearError();
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(code);
        showToast('代码已复制到剪贴板');
      } else {
        window.prompt('请手动复制以下代码', code);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '复制代码失败';
      setError(msg);
    }
  }, [code, clearError, setError, showToast]);

  const handleClearCode = useCallback(() => {
    setCode('');
    resetOutput();
  }, [setCode, resetOutput]);

  const handleSelectDiagram = useCallback(
    (id: string) => {
      if (id && id !== currentId) setCurrentId(id);
    },
    [currentId, setCurrentId],
  );

  const handleCreateDiagram = useCallback(() => {
    createDiagram(SAMPLES[engine] || '');
  }, [engine, createDiagram]);

  const handleRenameDiagram = useCallback(
    (id: string, currentName: string) => {
      if (typeof window === 'undefined') return;
      const next = window.prompt('请输入新的图名称', currentName || '');
      const trimmed = next?.trim();
      if (trimmed) renameDiagram(id, trimmed);
    },
    [renameDiagram],
  );

  const handleDeleteDiagram = useCallback(
    (id: string, name: string) => {
      if (typeof window === 'undefined') return;
      const label = name?.trim() || '未命名图';
      if (window.confirm(`确定要删除图「${label}」吗？此操作不可撤销。`)) {
        deleteDiagram(id);
      }
    },
    [deleteDiagram],
  );

  const handleExportWorkspace = useCallback(() => {
    try {
      const payload = {
        version: 1,
        exportedAt: new Date().toISOString(),
        currentId,
        diagrams,
      };
      const json = JSON.stringify(payload, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const ts = new Date().toISOString().replace(/[:T]/g, '-').slice(0, 19);
      a.href = url;
      a.download = `graphviewer-workspace-${ts}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '导出项目集失败';
      setError(msg);
    }
  }, [currentId, diagrams, setError]);

  const handleEngineChange = useCallback(
    (newEngine: Engine, loadSample?: boolean) => {
      setEngine(newEngine);
      if (loadSample) {
        setCode(SAMPLES[newEngine] || '');
        resetOutput();
      }
    },
    [setEngine, setCode, resetOutput],
  );

  return {
    handleCopyCode,
    handleClearCode,
    handleSelectDiagram,
    handleCreateDiagram,
    handleRenameDiagram,
    handleDeleteDiagram,
    handleExportWorkspace,
    handleEngineChange,
  };
}
