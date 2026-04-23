import { useCallback } from 'react';
import type { Engine } from '@/lib/diagramConfig';
import type { VersionRecord } from '@/hooks/useVersionHistory';

type VersionActionsDeps = {
  createVersion: (label?: string) => VersionRecord | null;
  clearDiagramVersions: () => void;
  setCode: (code: string) => void;
  setEngine: (engine: Engine) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  // 对话框回调（可选，用于替代 window.confirm）
  showConfirm?: (options: {
    title: string;
    message: string;
    variant?: 'default' | 'danger';
  }) => Promise<boolean>;
};

export function useVersionActions(deps: VersionActionsDeps) {
  const { createVersion, clearDiagramVersions, setCode, setEngine, showToast, showConfirm } = deps;

  const handleCreateSnapshot = useCallback(() => {
    const v = createVersion('手动快照');
    if (v) {
      showToast('快照已创建', 'success');
    } else {
      showToast('代码无变化，无需创建快照', 'info');
    }
  }, [createVersion, showToast]);

  const handleRestoreVersion = useCallback(
    (version: VersionRecord) => {
      setCode(version.code);
      setEngine(version.engine);
      showToast('已恢复到该版本', 'success');
    },
    [setCode, setEngine, showToast],
  );

  const handleClearVersions = useCallback(async () => {
    if (typeof window === 'undefined') return;

    let confirmed: boolean;
    if (showConfirm) {
      confirmed = await showConfirm({
        title: '清空版本历史',
        message: '确定要清空所有版本历史吗？此操作不可撤销。',
        variant: 'danger',
      });
    } else {
      confirmed = window.confirm('确定要清空所有版本历史吗？此操作不可撤销。');
    }

    if (confirmed) {
      clearDiagramVersions();
      showToast('版本历史已清空', 'info');
    }
  }, [clearDiagramVersions, showToast, showConfirm]);

  return {
    handleCreateSnapshot,
    handleRestoreVersion,
    handleClearVersions,
  };
}
