import { useCallback } from 'react';
import type { Engine } from '@/lib/diagramConfig';
import type { DiagramDoc } from '@/lib/types';
import { SAMPLES } from '@/lib/diagramSamples';
import type { DiagramTemplate } from '@/lib/diagramTemplates';
import { exportService } from '@/lib/export';

type WorkspaceActionsDeps = {
  engine: Engine;
  code: string;
  currentId: string;
  diagrams: DiagramDoc[];
  setCode: (code: string) => void;
  setEngine: (engine: Engine) => void;
  resetOutput: () => void;
  createDiagram: (defaultCode?: string, name?: string, engineOverride?: Engine) => void;
  renameDiagram: (id: string, name: string) => void;
  deleteDiagram: (id: string) => void;
  setCurrentId: (id: string) => void;
  clearError: () => void;
  setError: (msg: string) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  // 对话框回调（可选，用于替代 window.prompt/confirm）
  showPrompt?: (options: {
    title: string;
    message: string;
    defaultValue: string;
  }) => Promise<string | null>;
  showConfirm?: (options: {
    title: string;
    message: string;
    variant?: 'default' | 'danger';
  }) => Promise<boolean>;
};

export function useWorkspaceActions(deps: WorkspaceActionsDeps) {
  const {
    engine,
    code,
    currentId,
    diagrams,
    setCode,
    setEngine,
    resetOutput,
    createDiagram,
    renameDiagram,
    deleteDiagram,
    setCurrentId,
    clearError,
    setError,
    showToast,
    showPrompt,
    showConfirm,
  } = deps;

  const handleCopyCode = useCallback(async () => {
    clearError();
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(code);
        showToast('代码已复制到剪贴板');
      } else {
        // 降级：使用对话框显示代码
        if (showPrompt) {
          await showPrompt({
            title: '手动复制代码',
            message: '请选择并复制以下代码：',
            defaultValue: code,
          });
        } else {
          window.prompt('请手动复制以下代码', code);
        }
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '复制代码失败';
      setError(msg);
    }
  }, [code, clearError, setError, showToast, showPrompt]);

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
    async (id: string, currentName: string) => {
      if (typeof window === 'undefined') return;

      let trimmed: string | undefined;
      if (showPrompt) {
        const result = await showPrompt({
          title: '重命名图',
          message: '请输入新的图名称：',
          defaultValue: currentName || '',
        });
        trimmed = result?.trim();
      } else {
        const next = window.prompt('请输入新的图名称', currentName || '');
        trimmed = next?.trim();
      }

      if (trimmed) renameDiagram(id, trimmed);
    },
    [renameDiagram, showPrompt],
  );

  const handleDeleteDiagram = useCallback(
    async (id: string, name: string) => {
      if (typeof window === 'undefined') return;

      const label = name?.trim() || '未命名图';
      let confirmed: boolean;

      if (showConfirm) {
        confirmed = await showConfirm({
          title: '删除确认',
          message: `确定要删除图「${label}」吗？此操作不可撤销。`,
          variant: 'danger',
        });
      } else {
        confirmed = window.confirm(`确定要删除图「${label}」吗？此操作不可撤销。`);
      }

      if (confirmed) {
        deleteDiagram(id);
      }
    },
    [deleteDiagram, showConfirm],
  );

  const handleExportSourceCode = useCallback(async () => {
    try {
      if (!code.trim()) return;
      await exportService.exportDiagram({
        content: code,
        filename: 'diagram',
        type: 'source',
        engine,
      });
      showToast('源码文件已导出');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '导出源码失败';
      setError(msg);
    }
  }, [code, engine, setError, showToast]);

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

  const handleCreateFromTemplate = useCallback(
    (template: DiagramTemplate) => {
      createDiagram(template.code, template.name, template.engine);
      showToast(`已从模板「${template.name}」创建`);
    },
    [createDiagram, showToast],
  );

  return {
    handleCopyCode,
    handleClearCode,
    handleSelectDiagram,
    handleCreateDiagram,
    handleRenameDiagram,
    handleDeleteDiagram,
    handleExportWorkspace,
    handleExportSourceCode,
    handleEngineChange,
    handleCreateFromTemplate,
  };
}
