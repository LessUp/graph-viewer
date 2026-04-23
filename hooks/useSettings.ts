'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { loadFromStorage, saveToStorage, migrateStorageKey } from '@/lib/storage';
import { APP_CONFIG } from '@/lib/config';

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

    // 迁移旧版键名到新键名
    migrateStorageKey(
      APP_CONFIG.legacyStorageKeys.settingsKey,
      APP_CONFIG.storage.settingsKey,
    );

    const stored = loadFromStorage<Partial<AppSettings>>(APP_CONFIG.storage.settingsKey, {});
    setSettings({ ...DEFAULT_SETTINGS, ...stored });
    setIsLoaded(true);
  }, []);

  // 保存设置到 localStorage
  const saveSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      saveToStorage(APP_CONFIG.storage.settingsKey, updated);
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
