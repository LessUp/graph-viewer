'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { logger } from '@/lib/logger';

export interface AppSettings {
  // 渲染服务器配置
  renderServerUrl: string;
  useCustomServer: boolean;
  // 界面配置
  sidebarCollapsed: boolean;
  // 编辑器配置
  debounceMs: number;
  editorFontSize: number;
}

const DEFAULT_SETTINGS: AppSettings = {
  renderServerUrl: '',
  useCustomServer: false,
  sidebarCollapsed: false,
  debounceMs: 800,
  editorFontSize: 13,
};

const STORAGE_KEY = 'graphviewer-settings';

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);
  const settingsRef = useRef(settings);
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  // 从 localStorage 加载设置
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      }
    } catch (e: unknown) {
      logger.error('load-settings', { error: e instanceof Error ? e.message : 'Unknown error' });
    }
    setIsLoaded(true);
  }, []);

  // 保存设置到 localStorage
  const saveSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch (e: unknown) {
          logger.error('save-settings', {
            error: e instanceof Error ? e.message : 'Unknown error',
          });
        }
      }
      return updated;
    });
  }, []);

  const toggleSidebar = useCallback(() => {
    saveSettings({ sidebarCollapsed: !settingsRef.current.sidebarCollapsed });
  }, [saveSettings]);

  return {
    settings,
    isLoaded,
    saveSettings,
    toggleSidebar,
  };
}
