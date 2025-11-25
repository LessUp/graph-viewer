/**
 * 版本历史管理 Hook
 * 为每个图表提供版本历史记录和恢复功能
 */

import { useState, useCallback, useEffect } from 'react';

export type VersionRecord = {
  id: string;
  diagramId: string;
  code: string;
  engine: string;
  timestamp: string;
  label?: string; // 可选的版本标签
  autoSave: boolean; // 是否是自动保存
};

type VersionHistoryState = {
  versions: VersionRecord[];
  currentVersionId: string | null;
};

const STORAGE_KEY = 'graphviewer:versions:v1';
const MAX_VERSIONS_PER_DIAGRAM = 50; // 每个图表最多保存50个版本
const AUTO_SAVE_INTERVAL = 30000; // 自动保存间隔（30秒）
const MIN_CHANGE_THRESHOLD = 10; // 最小变化字符数才触发自动保存

function generateVersionId(): string {
  return `v-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function useVersionHistory(diagramId: string, currentCode: string, currentEngine: string) {
  const [versions, setVersions] = useState<VersionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 加载版本历史
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const allVersions: VersionRecord[] = JSON.parse(raw);
        setVersions(allVersions);
      }
    } catch (e) {
      console.error('加载版本历史失败:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 保存版本历史到 localStorage
  const saveVersionsToStorage = useCallback((newVersions: VersionRecord[]) => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(newVersions));
    } catch (e) {
      console.error('保存版本历史失败:', e);
    }
  }, []);

  // 获取当前图表的版本历史
  const diagramVersions = versions
    .filter(v => v.diagramId === diagramId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // 创建新版本
  const createVersion = useCallback((label?: string, autoSave = false) => {
    if (!diagramId || !currentCode.trim()) return null;

    // 检查是否与最新版本相同
    const latestVersion = diagramVersions[0];
    if (latestVersion && latestVersion.code === currentCode && latestVersion.engine === currentEngine) {
      return null; // 代码没有变化，不创建新版本
    }

    // 自动保存时检查变化是否足够大
    if (autoSave && latestVersion) {
      const changeSize = Math.abs(currentCode.length - latestVersion.code.length);
      if (changeSize < MIN_CHANGE_THRESHOLD) {
        return null;
      }
    }

    const newVersion: VersionRecord = {
      id: generateVersionId(),
      diagramId,
      code: currentCode,
      engine: currentEngine,
      timestamp: new Date().toISOString(),
      label,
      autoSave,
    };

    setVersions(prev => {
      // 获取当前图表的版本并限制数量
      const diagramVersions = prev.filter(v => v.diagramId === diagramId);
      const otherVersions = prev.filter(v => v.diagramId !== diagramId);
      
      let newDiagramVersions = [newVersion, ...diagramVersions];
      
      // 保留手动保存的版本，优先删除旧的自动保存版本
      if (newDiagramVersions.length > MAX_VERSIONS_PER_DIAGRAM) {
        const manualVersions = newDiagramVersions.filter(v => !v.autoSave);
        const autoVersions = newDiagramVersions.filter(v => v.autoSave);
        
        // 如果自动保存版本过多，删除旧的
        while (manualVersions.length + autoVersions.length > MAX_VERSIONS_PER_DIAGRAM && autoVersions.length > 5) {
          autoVersions.pop();
        }
        
        // 如果还是太多，删除旧的手动版本
        while (manualVersions.length + autoVersions.length > MAX_VERSIONS_PER_DIAGRAM) {
          manualVersions.pop();
        }
        
        newDiagramVersions = [...manualVersions, ...autoVersions]
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      }

      const newVersions = [...newDiagramVersions, ...otherVersions];
      saveVersionsToStorage(newVersions);
      return newVersions;
    });

    return newVersion;
  }, [diagramId, currentCode, currentEngine, diagramVersions, saveVersionsToStorage]);

  // 删除版本
  const deleteVersion = useCallback((versionId: string) => {
    setVersions(prev => {
      const newVersions = prev.filter(v => v.id !== versionId);
      saveVersionsToStorage(newVersions);
      return newVersions;
    });
  }, [saveVersionsToStorage]);

  // 重命名版本
  const renameVersion = useCallback((versionId: string, newLabel: string) => {
    setVersions(prev => {
      const newVersions = prev.map(v => 
        v.id === versionId ? { ...v, label: newLabel } : v
      );
      saveVersionsToStorage(newVersions);
      return newVersions;
    });
  }, [saveVersionsToStorage]);

  // 清除图表的所有版本历史
  const clearDiagramVersions = useCallback(() => {
    setVersions(prev => {
      const newVersions = prev.filter(v => v.diagramId !== diagramId);
      saveVersionsToStorage(newVersions);
      return newVersions;
    });
  }, [diagramId, saveVersionsToStorage]);

  // 自动保存
  useEffect(() => {
    if (!diagramId || !currentCode.trim()) return;

    const timer = setInterval(() => {
      createVersion(undefined, true);
    }, AUTO_SAVE_INTERVAL);

    return () => clearInterval(timer);
  }, [diagramId, currentCode, createVersion]);

  // 比较两个版本
  const compareVersions = useCallback((versionId1: string, versionId2: string) => {
    const v1 = versions.find(v => v.id === versionId1);
    const v2 = versions.find(v => v.id === versionId2);
    
    if (!v1 || !v2) return null;

    return {
      version1: v1,
      version2: v2,
      // 简单的差异统计
      diff: {
        addedLines: v2.code.split('\n').length - v1.code.split('\n').length,
        addedChars: v2.code.length - v1.code.length,
      }
    };
  }, [versions]);

  return {
    versions: diagramVersions,
    isLoading,
    createVersion,
    deleteVersion,
    renameVersion,
    clearDiagramVersions,
    compareVersions,
    totalVersionCount: diagramVersions.length,
  };
}
