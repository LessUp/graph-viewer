'use client';

import { useState, useEffect } from 'react';
import type { AppSettings } from '@/hooks/useSettings';
import { Settings, X, Info, Palette } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (settings: Partial<AppSettings>) => void;
}

export function SettingsModal({ isOpen, onClose, settings, onSave }: SettingsModalProps) {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-md animate-fade-in rounded-2xl bg-white p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
              <Settings className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">设置</h2>
              <p className="text-xs text-slate-400">配置渲染服务器和界面选项</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* 渲染服务器配置 */}
          <div className="rounded-xl border border-slate-200 p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-slate-700">自定义渲染服务器</h3>
                <p className="text-xs text-slate-400 mt-0.5">使用自建的 Kroki 服务器获得更好的渲染效果</p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={localSettings.useCustomServer}
                  onChange={(e) => setLocalSettings({ ...localSettings, useCustomServer: e.target.checked })}
                  className="peer sr-only"
                />
                <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-sky-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-sky-100"></div>
              </label>
            </div>
            
            {localSettings.useCustomServer && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    服务器地址
                  </label>
                  <input
                    type="url"
                    value={localSettings.renderServerUrl}
                    onChange={(e) => setLocalSettings({ ...localSettings, renderServerUrl: e.target.value })}
                    placeholder="例如: https://kroki.example.com"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
                  />
                </div>
                <div className="rounded-lg bg-amber-50 p-3">
                  <div className="flex gap-2">
                    <Info className="h-4 w-4 flex-shrink-0 text-amber-500 mt-0.5" />
                    <div className="text-xs text-amber-700">
                      <p className="font-medium">如何部署 Kroki 服务器？</p>
                      <p className="mt-1 text-amber-600">
                        使用 Docker 快速部署：
                        <code className="ml-1 rounded bg-amber-100 px-1 py-0.5 font-mono text-[10px]">
                          docker run -p 8000:8000 yuzutech/kroki
                        </code>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 关于 */}
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-indigo-500">
                <Palette className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">GraphViewer</p>
                <p className="text-xs text-slate-400">支持 Mermaid、Graphviz、PlantUML 等多种图表格式</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 transition"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600 transition"
          >
            保存设置
          </button>
        </div>
      </div>
    </div>
  );
}
