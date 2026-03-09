/**
 * 版本历史管理 Hook
 * 为每个图表提供版本历史记录和恢复功能
 */

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import type { Engine } from '@/lib/diagramConfig';

export type VersionRecord = {
  id: string;
  diagramId: string;
  code: string;
  engine: Engine;
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

export function useVersionHistory(diagramId: string, currentCode: string, currentEngine: Engine) {
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
    } catch (e: unknown) {
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
    } catch (e: unknown) {
      console.error('保存版本历史失败:', e);
    }
  }, []);

  // 使用 ref 保持最新值，避免 createVersion / interval 被频繁重建
  const codeRef = useRef(currentCode);
  const engineRef = useRef(currentEngine);
  useEffect(() => {
    codeRef.current = currentCode;
  }, [currentCode]);
  useEffect(() => {
    engineRef.current = currentEngine;
  }, [currentEngine]);

  // 获取当前图表的版本历史（memoize 避免每次渲染重新排序）
  const diagramVersions = useMemo(
    () =>
      versions
        .filter((v) => v.diagramId === diagramId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    [versions, diagramId],
  );

  // 创建新版本 —— 通过 ref 读取 code/engine，避免依赖数组包含高频变化值
  const createVersion = useCallback(
    (label?: string, autoSave = false) => {
      const code = codeRef.current;
      const eng = engineRef.current;
      if (!diagramId || !code.trim()) return null;

      let result: VersionRecord | null = null;

      setVersions((prev) => {
        const currentDiagramVersions = prev
          .filter((v) => v.diagramId === diagramId)
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        const otherVersions = prev.filter((v) => v.diagramId !== diagramId);

        // 检查是否与最新版本相同
        const latestVersion = currentDiagramVersions[0];
        if (latestVersion && latestVersion.code === code && latestVersion.engine === eng) {
          return prev;
        }

        // 自动保存时检查变化是否足够大
        if (autoSave && latestVersion) {
          const changeSize = Math.abs(code.length - latestVersion.code.length);
          if (changeSize < MIN_CHANGE_THRESHOLD) {
            return prev;
          }
        }

        const newVersion: VersionRecord = {
          id: generateVersionId(),
          diagramId,
          code,
          engine: eng,
          timestamp: new Date().toISOString(),
          label,
          autoSave,
        };

        result = newVersion;

        let newDiagramVersions = [newVersion, ...currentDiagramVersions];

        // 保留手动保存的版本，优先删除旧的自动保存版本
        if (newDiagramVersions.length > MAX_VERSIONS_PER_DIAGRAM) {
          const manualVersions = newDiagramVersions.filter((v) => !v.autoSave);
          const autoVersions = newDiagramVersions.filter((v) => v.autoSave);

          while (
            manualVersions.length + autoVersions.length > MAX_VERSIONS_PER_DIAGRAM &&
            autoVersions.length > 5
          ) {
            autoVersions.pop();
          }
          while (manualVersions.length + autoVersions.length > MAX_VERSIONS_PER_DIAGRAM) {
            manualVersions.pop();
          }

          newDiagramVersions = [...manualVersions, ...autoVersions].sort(
            (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
          );
        }

        const newVersions = [...newDiagramVersions, ...otherVersions];
        saveVersionsToStorage(newVersions);
        return newVersions;
      });

      return result;
    },
    [diagramId, saveVersionsToStorage],
  );

  // 删除版本
  const deleteVersion = useCallback(
    (versionId: string) => {
      setVersions((prev) => {
        const newVersions = prev.filter((v) => v.id !== versionId);
        saveVersionsToStorage(newVersions);
        return newVersions;
      });
    },
    [saveVersionsToStorage],
  );

  // 重命名版本
  const renameVersion = useCallback(
    (versionId: string, newLabel: string) => {
      setVersions((prev) => {
        const newVersions = prev.map((v) => (v.id === versionId ? { ...v, label: newLabel } : v));
        saveVersionsToStorage(newVersions);
        return newVersions;
      });
    },
    [saveVersionsToStorage],
  );

  // 清除图表的所有版本历史
  const clearDiagramVersions = useCallback(() => {
    setVersions((prev) => {
      const newVersions = prev.filter((v) => v.diagramId !== diagramId);
      saveVersionsToStorage(newVersions);
      return newVersions;
    });
  }, [diagramId, saveVersionsToStorage]);

  // 自动保存 —— 仅在 diagramId 变化时重建 interval（createVersion 现在稳定）
  useEffect(() => {
    if (!diagramId) return;

    const timer = setInterval(() => {
      if (codeRef.current.trim()) {
        createVersion(undefined, true);
      }
    }, AUTO_SAVE_INTERVAL);

    return () => clearInterval(timer);
  }, [diagramId, createVersion]);

  return {
    versions: diagramVersions,
    isLoading,
    createVersion,
    deleteVersion,
    renameVersion,
    clearDiagramVersions,
  };
}
