'use client';

import { useState, useEffect, useCallback } from 'react';

export interface AppSettings {
  // 渲染服务器配置
  renderServerUrl: string;
  useCustomServer: boolean;
  // 界面配置
  sidebarCollapsed: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  renderServerUrl: '',
  useCustomServer: false,
  sidebarCollapsed: false,
};

const STORAGE_KEY = 'graphviewer-settings';

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // 从 localStorage 加载设置
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      }
    } catch (e) {
      console.error('Failed to load settings:', e);
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
        } catch (e) {
          console.error('Failed to save settings:', e);
        }
      }
      return updated;
    });
  }, []);

  const toggleSidebar = useCallback(() => {
    saveSettings({ sidebarCollapsed: !settings.sidebarCollapsed });
  }, [settings.sidebarCollapsed, saveSettings]);

  return {
    settings,
    isLoaded,
    saveSettings,
    toggleSidebar,
  };
}
