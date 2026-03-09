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
      <div className="animate-fade-in w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
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
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
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
                <p className="mt-0.5 text-xs text-slate-400">
                  使用自建的 Kroki 服务器获得更好的渲染效果
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={localSettings.useCustomServer}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, useCustomServer: e.target.checked })
                  }
                  className="peer sr-only"
                />
                <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-sky-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-sky-100"></div>
              </label>
            </div>

            {localSettings.useCustomServer && (
              <div className="space-y-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-600">
                    服务器地址
                  </label>
                  <input
                    type="url"
                    value={localSettings.renderServerUrl}
                    onChange={(e) =>
                      setLocalSettings({ ...localSettings, renderServerUrl: e.target.value })
                    }
                    placeholder="例如: https://kroki.example.com"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
                  />
                </div>
                <div className="rounded-lg bg-amber-50 p-3">
                  <div className="flex gap-2">
                    <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
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

          {/* 编辑器配置 */}
          <div className="space-y-4 rounded-xl border border-slate-200 p-4">
            <h3 className="text-sm font-medium text-slate-700">编辑器</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600">
                  实时预览延迟 (ms)
                </label>
                <input
                  type="number"
                  min={200}
                  max={3000}
                  step={100}
                  value={localSettings.debounceMs}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      debounceMs: Math.max(200, Math.min(3000, Number(e.target.value) || 800)),
                    })
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
                />
                <p className="mt-1 text-[10px] text-slate-400">停止输入后多久触发渲染</p>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600">
                  字体大小 (px)
                </label>
                <input
                  type="number"
                  min={10}
                  max={24}
                  step={1}
                  value={localSettings.editorFontSize}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      editorFontSize: Math.max(10, Math.min(24, Number(e.target.value) || 13)),
                    })
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
                />
                <p className="mt-1 text-[10px] text-slate-400">代码编辑器字体大小</p>
              </div>
            </div>
          </div>

          {/* 关于 */}
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-indigo-500">
                <Palette className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">GraphViewer</p>
                <p className="text-xs text-slate-400">
                  支持 Mermaid、Graphviz、PlantUML 等多种图表格式
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-600"
          >
            保存设置
          </button>
        </div>
      </div>
    </div>
  );
}
