'use client';

import { useRef } from 'react';
import { Palette, Upload, Download, Settings, Github } from 'lucide-react';

export type AppHeaderProps = {
  onImportWorkspace: (data: { diagrams: any[]; currentId?: string }) => void;
  onExportWorkspace: () => void;
  onOpenSettings: () => void;
  onError: (message: string) => void;
};

export function AppHeader({
  onImportWorkspace,
  onExportWorkspace,
  onOpenSettings,
  onError,
}: AppHeaderProps) {
  const importInputRef = useRef<HTMLInputElement | null>(null);

  function handleImportClick() {
    if (importInputRef.current) {
      importInputRef.current.value = '';
      importInputRef.current.click();
    }
  }

  async function handleImportChange(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      const file = event.target.files?.[0];
      if (!file) return;
      const text = await file.text();
      const data = JSON.parse(text) as { diagrams?: any; currentId?: string };
      if (!Array.isArray(data.diagrams) || data.diagrams.length === 0) {
        throw new Error('导入的文件中不包含有效的图列表。');
      }
      onImportWorkspace({ diagrams: data.diagrams, currentId: data.currentId });
    } catch (e: any) {
      onError(e?.message || '导入项目集失败');
    } finally {
      if (event.target) {
        event.target.value = '';
      }
    }
  }

  return (
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-indigo-500">
          <Palette className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-slate-800">GraphViewer</h1>
          <p className="text-[11px] text-slate-400">图表可视化工具</p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={handleImportClick}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 transition"
          title="导入工作区 (JSON 格式，包含所有图表数据)"
        >
          <Upload className="h-3.5 w-3.5" />
          导入工作区
        </button>
        <button
          onClick={onExportWorkspace}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 transition"
          title="导出工作区 (JSON 格式，包含所有图表数据)"
        >
          <Download className="h-3.5 w-3.5" />
          导出工作区
        </button>
        <div className="mx-1.5 h-4 w-px bg-slate-200"></div>
        <button
          onClick={onOpenSettings}
          className="flex items-center justify-center rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition"
          title="设置"
        >
          <Settings className="h-4 w-4" />
        </button>
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition"
          title="GitHub"
        >
          <Github className="h-5 w-5" />
        </a>
        <input
          ref={importInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleImportChange}
        />
      </div>
    </header>
  );
}
