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
  label?: string;
  autoSave: boolean;
};

const STORAGE_KEY = 'graphviewer:versions:v1';
const MAX_VERSIONS_PER_DIAGRAM = 50;
const AUTO_SAVE_INTERVAL = 30000;
const MAX_AUTO_SAVE_PER_DIAGRAM = 10;
const STORAGE_WRITE_DEBOUNCE_MS = 250;

function generateVersionId(): string {
  return `v-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function normalizeCodeForComparison(code: string): string {
  return code.replace(/\r\n/g, '\n').trim();
}

function hasMeaningfulContentChange(nextCode: string, previousCode: string): boolean {
  return normalizeCodeForComparison(nextCode) !== normalizeCodeForComparison(previousCode);
}

function sortVersions(records: VersionRecord[]): VersionRecord[] {
  return [...records].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

function trimDiagramVersions(records: VersionRecord[]): VersionRecord[] {
  if (records.length <= MAX_VERSIONS_PER_DIAGRAM) {
    return records;
  }

  const manualVersions = records.filter((v) => !v.autoSave);
  const autoVersions = records.filter((v) => v.autoSave).slice(0, MAX_AUTO_SAVE_PER_DIAGRAM);

  return sortVersions([...manualVersions, ...autoVersions]).slice(0, MAX_VERSIONS_PER_DIAGRAM);
}

export function useVersionHistory(diagramId: string, currentCode: string, currentEngine: Engine) {
  const [versions, setVersions] = useState<VersionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const versionsRef = useRef<VersionRecord[]>([]);
  const codeRef = useRef(currentCode);
  const engineRef = useRef(currentEngine);

  useEffect(() => {
    versionsRef.current = versions;
  }, [versions]);

  useEffect(() => {
    codeRef.current = currentCode;
  }, [currentCode]);

  useEffect(() => {
    engineRef.current = currentEngine;
  }, [currentEngine]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const allVersions: VersionRecord[] = JSON.parse(raw);
        versionsRef.current = allVersions;
        setVersions(allVersions);
      }
    } catch (e: unknown) {
      console.error('加载版本历史失败:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || isLoading) return;

    const timer = window.setTimeout(() => {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(versions));
      } catch (e: unknown) {
        console.error('保存版本历史失败:', e);
      }
    }, STORAGE_WRITE_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [versions, isLoading]);

  const diagramVersions = useMemo(
    () => sortVersions(versions.filter((v) => v.diagramId === diagramId)),
    [versions, diagramId],
  );

  const createVersion = useCallback(
    (label?: string, autoSave = false) => {
      const code = codeRef.current;
      const engine = engineRef.current;
      if (!diagramId || !code.trim()) return null;

      const currentDiagramVersions = sortVersions(
        versionsRef.current.filter((v) => v.diagramId === diagramId),
      );
      const otherVersions = versionsRef.current.filter((v) => v.diagramId !== diagramId);
      const latestVersion = currentDiagramVersions[0];

      if (
        latestVersion &&
        latestVersion.engine === engine &&
        !hasMeaningfulContentChange(code, latestVersion.code)
      ) {
        return null;
      }

      const newVersion: VersionRecord = {
        id: generateVersionId(),
        diagramId,
        code,
        engine,
        timestamp: new Date().toISOString(),
        label,
        autoSave,
      };

      const nextVersions = [
        ...trimDiagramVersions([newVersion, ...currentDiagramVersions]),
        ...otherVersions,
      ];

      versionsRef.current = nextVersions;
      setVersions(nextVersions);
      return newVersion;
    },
    [diagramId],
  );

  const deleteVersion = useCallback((versionId: string) => {
    const nextVersions = versionsRef.current.filter((v) => v.id !== versionId);
    versionsRef.current = nextVersions;
    setVersions(nextVersions);
  }, []);

  const renameVersion = useCallback((versionId: string, newLabel: string) => {
    const nextVersions = versionsRef.current.map((v) =>
      v.id === versionId ? { ...v, label: newLabel } : v,
    );
    versionsRef.current = nextVersions;
    setVersions(nextVersions);
  }, []);

  const clearDiagramVersions = useCallback(() => {
    const nextVersions = versionsRef.current.filter((v) => v.diagramId !== diagramId);
    versionsRef.current = nextVersions;
    setVersions(nextVersions);
  }, [diagramId]);

  useEffect(() => {
    if (!diagramId) return;

    const timer = window.setInterval(() => {
      if (codeRef.current.trim()) {
        createVersion(undefined, true);
      }
    }, AUTO_SAVE_INTERVAL);

    return () => window.clearInterval(timer);
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
