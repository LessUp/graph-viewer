
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { EditorPanel } from '@/components/EditorPanel';
import { PreviewPanel } from '@/components/PreviewPanel';
import { SettingsModal } from '@/components/SettingsModal';
import { Toast } from '@/components/Toast';
import { useDiagramState } from '@/hooks/useDiagramState';
import { useDiagramRender } from '@/hooks/useDiagramRender';
import { useSettings } from '@/hooks/useSettings';
import { useToast } from '@/hooks/useToast';
import { SAMPLES } from '@/lib/diagramSamples';
import {
  Palette,
  Upload,
  Download,
  Settings,
  Github,
  ChevronsRight,
  ChevronsLeft,
  Plus,
  Layers,
  Pencil,
  Trash2,
} from 'lucide-react';

export default function Page() {
  const {
    engine,
    format,
    code,
    codeStats,
    linkError,
    diagrams,
    currentId,
    setEngine,
    setFormat,
    setCode,
    setCurrentId,
    createDiagram,
    renameDiagram,
    deleteDiagram,
    importWorkspace,
  } = useDiagramState(SAMPLES['mermaid']);

  // 强制使用 SVG 格式以获得最佳体验，除非特定需求
  // 在新设计中，我们主要依赖前端导出，所以渲染格式首选 SVG
  useEffect(() => {
    if (format !== 'svg') {
      setFormat('svg');
    }
  }, [format, setFormat]);

  // 设置管理
  const { settings, saveSettings, toggleSidebar } = useSettings();

  const {
    svg,
    base64,
    contentType,
    loading,
    error,
    canUseLocalRender,
    showPreview,
    renderDiagram,
    clearError,
    setError,
    resetOutput,
  } = useDiagramRender(
    engine,
    'svg',
    code,
    settings.useCustomServer ? settings.renderServerUrl : undefined,
  ); // 强制传入 'svg' 给 render hook

  const [livePreview, setLivePreview] = useState(true); // 默认开启实时预览
  const [showSettings, setShowSettings] = useState(false);
  const debounceRef = useRef<number | null>(null);
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const { toast, showToast } = useToast();

  const combinedError = error || linkError;

  const sortedDiagrams = [...diagrams].sort((a, b) => {
    const ta = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
    const tb = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
    return tb - ta;
  });

  useEffect(() => {
    if (!livePreview) {
      if (debounceRef.current !== null) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
      return;
    }

    if (!code.trim()) {
      resetOutput();
      return;
    }

    if (debounceRef.current !== null) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = window.setTimeout(() => {
      void renderDiagram();
    }, 800);

    return () => {
      if (debounceRef.current !== null) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    };
  }, [livePreview, engine, code, renderDiagram, resetOutput]); // removed format dependency

  async function handleCopyCode() {
    clearError();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(code);
        showToast('代码已复制到剪贴板');
      } else {
        window.prompt('请手动复制以下代码', code);
      }
    } catch (e: any) {
      setError(e?.message || '复制代码失败');
    }
  }

  function handleClearCode() {
    setCode('');
    resetOutput();
  }

  function handleSelectDiagram(id: string) {
    if (!id || id === currentId) return;
    setCurrentId(id);
  }

  function handleCreateDiagram() {
    // 新建图表时加载当前引擎的示例代码
    createDiagram(SAMPLES[engine] || '');
  }

  function handleRenameDiagram(id: string, currentName: string) {
    if (typeof window === 'undefined') return;
    const next = window.prompt('请输入新的图名称', currentName || '');
    if (!next) return;
    const trimmed = next.trim();
    if (!trimmed) return;
    renameDiagram(id, trimmed);
  }

  function handleDeleteDiagram(id: string, name: string) {
    if (typeof window === 'undefined') return;
    const label = name && name.trim().length > 0 ? name.trim() : '未命名图';
    const ok = window.confirm(`确定要删除图「${label}」吗？此操作不可撤销。`);
    if (!ok) return;
    deleteDiagram(id);
  }

  function handleExportWorkspace() {
    try {
      const payload = {
        version: 1,
        exportedAt: new Date().toISOString(),
        currentId,
        diagrams,
      };
      const json = JSON.stringify(payload, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const ts = new Date().toISOString().replace(/[:T]/g, '-').slice(0, 19);
      a.href = url;
      a.download = `graphviewer-workspace-${ts}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      setError(e?.message || '导出项目集失败');
    }
  }

  function handleImportWorkspaceClick() {
    if (importInputRef.current) {
      importInputRef.current.value = '';
      importInputRef.current.click();
    }
  }

  async function handleImportWorkspaceChange(event: any) {
    try {
      const file: File | undefined = event?.target?.files?.[0];
      if (!file) return;
      const text = await file.text();
      const data = JSON.parse(text) as { diagrams?: any; currentId?: string };
      if (!Array.isArray(data.diagrams) || data.diagrams.length === 0) {
        throw new Error('导入的文件中不包含有效的图列表。');
      }
      importWorkspace({ diagrams: data.diagrams, currentId: data.currentId });
    } catch (e: any) {
      setError(e?.message || '导入项目集失败');
    } finally {
      if (event?.target) {
        event.target.value = '';
      }
    }
  }

  return (
    <main className="relative isolate mx-auto flex min-h-screen w-full max-w-[1800px] flex-col gap-5 px-4 py-4 md:px-6 lg:gap-5 lg:py-5">
      {/* Toast 提示 */}
      <Toast toast={toast} />
      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSave={saveSettings}
      />

      {/* Header Section - 极简风格 */}
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
             onClick={handleImportWorkspaceClick}
             className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 transition"
             title="导入工作区 (JSON 格式，包含所有图表数据)"
          >
            <Upload className="h-3.5 w-3.5" />
            导入工作区
          </button>
          <button
             onClick={handleExportWorkspace}
             className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 transition"
             title="导出工作区 (JSON 格式，包含所有图表数据)"
          >
            <Download className="h-3.5 w-3.5" />
            导出工作区
          </button>
          <div className="mx-1.5 h-4 w-px bg-slate-200"></div>
          <button
            onClick={() => setShowSettings(true)}
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
            onChange={handleImportWorkspaceChange}
          />
        </div>
      </header>

      {/* Workspace Section */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:h-[calc(100vh-140px)]">
        {/* Left Sidebar: Diagrams List & Editor */}
        <div className={`flex flex-col gap-4 lg:h-full lg:shrink-0 transition-all duration-300 ${
          settings.sidebarCollapsed ? 'lg:w-12' : 'w-full lg:w-[460px]'
        }`}>
          {/* 折叠状态下的侧边栏 */}
          {settings.sidebarCollapsed ? (
            <div className="hidden lg:flex flex-col items-center gap-2 rounded-2xl border border-slate-200/80 bg-white p-2 shadow-sm h-full">
              <button
                onClick={toggleSidebar}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition"
                title="展开侧边栏"
              >
                <ChevronsRight className="h-4 w-4" />
              </button>
              <div className="w-full h-px bg-slate-100"></div>
              <button
                onClick={handleCreateDiagram}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-sky-600 hover:bg-sky-50 transition"
                title="新建图表"
              >
                <Plus className="h-4 w-4" />
              </button>
              <span className="text-[10px] font-medium text-slate-400">{diagrams.length}</span>
            </div>
          ) : (
            <>
              {/* Diagram List */}
              <div className="flex-shrink-0 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100">
                      <Layers className="h-3.5 w-3.5 text-slate-500" />
                    </div>
                    <span className="text-sm font-semibold text-slate-700">我的图表</span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">{diagrams.length}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handleCreateDiagram}
                      className="flex items-center gap-1.5 rounded-lg bg-sky-50 px-2.5 py-1.5 text-xs font-medium text-sky-600 hover:bg-sky-100 transition"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      新建
                    </button>
                    <button
                      onClick={toggleSidebar}
                      className="hidden lg:flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                      title="收起侧边栏"
                    >
                      <ChevronsLeft className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-y-auto lg:max-h-[120px]">
                  {sortedDiagrams.map((d) => (
                    <div
                      key={d.id}
                      onClick={() => handleSelectDiagram(d.id)}
                      className={`group flex shrink-0 cursor-pointer items-center justify-between gap-2 rounded-xl border px-3 py-2 transition-all ${
                        d.id === currentId
                          ? 'border-sky-400 bg-sky-50 text-sky-700'
                          : 'border-slate-100 bg-slate-50/50 text-slate-600 hover:border-slate-200 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${d.id === currentId ? 'bg-sky-500' : 'bg-slate-300'}`}></div>
                        <span className="truncate text-xs font-medium">{d.name}</span>
                      </div>
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRenameDiagram(d.id, d.name);
                          }}
                          className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                          title="重命名"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteDiagram(d.id, d.name);
                          }}
                          className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-500"
                          title="删除"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Editor */}
              <div className="flex-1 min-h-[400px] lg:min-h-0">
                <EditorPanel
                  engine={engine}
                  code={code}
                  codeStats={codeStats}
                  loading={loading}
                  error={combinedError}
                  canUseLocalRender={canUseLocalRender}
                  livePreviewEnabled={livePreview}
                  onLivePreviewChange={setLivePreview}
                  onEngineChange={(newEngine, loadSample) => {
                    setEngine(newEngine);
                    if (loadSample) {
                      setCode(SAMPLES[newEngine] || '');
                      resetOutput();
                    }
                  }}
                  onCodeChange={setCode}
                  onRender={renderDiagram}
                  onCopyCode={handleCopyCode}
                  onClearCode={handleClearCode}
                />
              </div>
            </>
          )}
        </div>

        {/* Right Content: Preview */}
        <div className="flex-1 h-[500px] lg:h-full">
          <PreviewPanel
            svg={svg}
            base64={base64}
            contentType={contentType}
            loading={loading}
            showPreview={showPreview}
            format={'svg'}
            code={code}
            engine={engine}
          />
        </div>
      </div>
    </main>
  );
}
