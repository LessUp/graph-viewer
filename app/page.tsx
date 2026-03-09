
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { PreviewPanel } from '@/components/PreviewPanel';
import { SettingsModal } from '@/components/SettingsModal';
import { Toast } from '@/components/Toast';
import { AppHeader } from '@/components/AppHeader';
import { DiagramList } from '@/components/DiagramList';
import { CollapsedSidebar } from '@/components/CollapsedSidebar';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { SidebarTabs, type SidebarTab } from '@/components/SidebarTabs';
import { useDiagramState } from '@/hooks/useDiagramState';
import { useDiagramRender } from '@/hooks/useDiagramRender';
import { useSettings } from '@/hooks/useSettings';
import { useToast } from '@/hooks/useToast';
import { useAIAssistant } from '@/hooks/useAIAssistant';
import { useVersionHistory, type VersionRecord } from '@/hooks/useVersionHistory';
import { SAMPLES } from '@/lib/diagramSamples';
import { Loader2 } from 'lucide-react';

export default function Page() {
  const {
    engine,
    format,
    code,
    codeStats,
    linkError,
    diagrams,
    currentId,
    hasHydrated,
    setEngine,
    setFormat,
    setCode,
    setCurrentId,
    createDiagram,
    renameDiagram,
    deleteDiagram,
    importWorkspace,
  } = useDiagramState(SAMPLES['mermaid']);

  const { settings, isLoaded: settingsLoaded, saveSettings, toggleSidebar } = useSettings();

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
    format,
    code,
    settings.useCustomServer ? settings.renderServerUrl : undefined,
  );

  const [livePreview, setLivePreview] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('editor');
  const debounceRef = useRef<number | null>(null);
  const { toast, showToast } = useToast();

  // AI 助手
  const {
    config: aiConfig,
    updateConfig: updateAIConfig,
    state: aiState,
    analyzeCode,
    generateCode,
    fixCode,
    clearError: clearAIError,
    clearAnalysis: clearAIAnalysis,
    isConfigured: isAIConfigured,
  } = useAIAssistant(engine);

  // 版本历史
  const {
    versions,
    isLoading: isVersionsLoading,
    createVersion,
    deleteVersion,
    renameVersion,
    clearDiagramVersions,
  } = useVersionHistory(currentId, code, engine);

  const combinedError = error || linkError;

  // 实时预览 debounce
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
    if (debounceRef.current !== null) clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => void renderDiagram(), settings.debounceMs);
    return () => {
      if (debounceRef.current !== null) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    };
  }, [livePreview, engine, code, settings.debounceMs, renderDiagram, resetOutput]);

  // --- 事件处理 ---

  const handleCopyCode = useCallback(async () => {
    clearError();
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(code);
        showToast('代码已复制到剪贴板');
      } else {
        window.prompt('请手动复制以下代码', code);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '复制代码失败';
      setError(msg);
    }
  }, [code, clearError, setError, showToast]);

  const handleClearCode = useCallback(() => {
    setCode('');
    resetOutput();
  }, [setCode, resetOutput]);

  const handleSelectDiagram = useCallback(
    (id: string) => {
      if (id && id !== currentId) setCurrentId(id);
    },
    [currentId, setCurrentId],
  );

  const handleCreateDiagram = useCallback(() => {
    createDiagram(SAMPLES[engine] || '');
  }, [engine, createDiagram]);

  const handleRenameDiagram = useCallback(
    (id: string, currentName: string) => {
      if (typeof window === 'undefined') return;
      const next = window.prompt('请输入新的图名称', currentName || '');
      const trimmed = next?.trim();
      if (trimmed) renameDiagram(id, trimmed);
    },
    [renameDiagram],
  );

  const handleDeleteDiagram = useCallback(
    (id: string, name: string) => {
      if (typeof window === 'undefined') return;
      const label = name?.trim() || '未命名图';
      if (window.confirm(`确定要删除图「${label}」吗？此操作不可撤销。`)) {
        deleteDiagram(id);
      }
    },
    [deleteDiagram],
  );

  const handleExportWorkspace = useCallback(() => {
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
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '导出项目集失败';
      setError(msg);
    }
  }, [currentId, diagrams, setError]);

  const handleEngineChange = useCallback(
    (newEngine: typeof engine, loadSample?: boolean) => {
      setEngine(newEngine);
      if (loadSample) {
        setCode(SAMPLES[newEngine] || '');
        resetOutput();
      }
    },
    [setEngine, setCode, resetOutput],
  );

  // --- AI 助手事件处理 ---
  const handleAIAnalyze = useCallback(() => {
    if (!code.trim()) return;
    analyzeCode(code);
  }, [code, analyzeCode]);

  const handleAIFix = useCallback(async () => {
    if (!code.trim()) return;
    const fixed = await fixCode(code, combinedError || undefined);
    if (fixed) {
      setCode(fixed);
      showToast('AI 已修复代码', 'success');
    }
  }, [code, combinedError, fixCode, setCode, showToast]);

  const handleAIGenerate = useCallback(async (description: string) => {
    const generated = await generateCode(description);
    if (generated) {
      setCode(generated);
      setSidebarTab('editor');
      showToast('代码已生成', 'success');
    }
  }, [generateCode, setCode, showToast]);

  const handleAIApplyCode = useCallback((newCode: string) => {
    setCode(newCode);
    setSidebarTab('editor');
    showToast('已应用修改', 'success');
  }, [setCode, showToast]);

  // --- 版本历史事件处理 ---
  const handleCreateSnapshot = useCallback(() => {
    const v = createVersion('手动快照');
    if (v) {
      showToast('快照已创建', 'success');
    } else {
      showToast('代码无变化，无需创建快照', 'info');
    }
  }, [createVersion, showToast]);

  const handleRestoreVersion = useCallback((version: VersionRecord) => {
    setCode(version.code);
    setEngine(version.engine);
    showToast('已恢复到该版本', 'success');
  }, [setCode, setEngine, showToast]);

  const handleClearVersions = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (window.confirm('确定要清空所有版本历史吗？此操作不可撤销。')) {
      clearDiagramVersions();
      showToast('版本历史已清空', 'info');
    }
  }, [clearDiagramVersions, showToast]);

  // 水合加载状态
  if (!hasHydrated || !settingsLoaded) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
          <span className="text-sm text-slate-500">加载中...</span>
        </div>
      </main>
    );
  }

  return (
    <ErrorBoundary>
      <main className="relative isolate mx-auto flex min-h-screen w-full max-w-[1920px] flex-col gap-4 px-3 py-3 sm:px-4 sm:py-4 md:px-6 lg:gap-4 lg:py-5">
        <Toast toast={toast} />
        <SettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          settings={settings}
          onSave={saveSettings}
        />

        <AppHeader
          onImportWorkspace={importWorkspace}
          onExportWorkspace={handleExportWorkspace}
          onOpenSettings={() => setShowSettings(true)}
          onError={setError}
        />

        {/* Workspace Section */}
        <div className="flex flex-col gap-4 lg:h-[calc(100vh-150px)] lg:flex-row lg:items-stretch lg:gap-5">
          {/* Left Sidebar */}
          <div
            className={`flex min-h-0 flex-col gap-4 transition-all duration-300 ${
              settings.sidebarCollapsed ? 'lg:w-14' : 'w-full lg:w-[430px] xl:w-[470px]'
            }`}
          >
            {settings.sidebarCollapsed ? (
              <CollapsedSidebar
                diagramCount={diagrams.length}
                onExpand={toggleSidebar}
                onCreate={handleCreateDiagram}
              />
            ) : (
              <>
                <DiagramList
                  diagrams={diagrams}
                  currentId={currentId}
                  onSelect={handleSelectDiagram}
                  onCreate={handleCreateDiagram}
                  onRename={handleRenameDiagram}
                  onDelete={handleDeleteDiagram}
                  onCollapseSidebar={toggleSidebar}
                />

                <SidebarTabs
                  activeTab={sidebarTab}
                  onTabChange={setSidebarTab}
                  versions={versions}
                  editorProps={{
                    engine,
                    format,
                    code,
                    codeStats,
                    loading,
                    error: combinedError,
                    canUseLocalRender,
                    livePreviewEnabled: livePreview,
                    onLivePreviewChange: setLivePreview,
                    onEngineChange: handleEngineChange,
                    onFormatChange: setFormat,
                    onCodeChange: setCode,
                    onRender: renderDiagram,
                    onCopyCode: handleCopyCode,
                    onClearCode: handleClearCode,
                    editorFontSize: settings.editorFontSize,
                  }}
                  aiProps={{
                    config: aiConfig,
                    isConfigured: isAIConfigured,
                    isAnalyzing: aiState.isAnalyzing,
                    isGenerating: aiState.isGenerating,
                    lastAnalysis: aiState.lastAnalysis,
                    error: aiState.error,
                    onUpdateConfig: updateAIConfig,
                    onAnalyze: handleAIAnalyze,
                    onFix: handleAIFix,
                    onGenerate: handleAIGenerate,
                    onApplyCode: handleAIApplyCode,
                    onClearError: clearAIError,
                    onClearAnalysis: clearAIAnalysis,
                  }}
                  historyProps={{
                    versions,
                    isLoading: isVersionsLoading,
                    onRestore: handleRestoreVersion,
                    onDelete: deleteVersion,
                    onRename: renameVersion,
                    onCreateSnapshot: handleCreateSnapshot,
                    onClearAll: handleClearVersions,
                  }}
                />
              </>
            )}
          </div>

          {/* Right: Preview */}
          <div className="flex-1 min-h-[420px] lg:h-full lg:min-h-0">
            <PreviewPanel
              svg={svg}
              base64={base64}
              contentType={contentType}
              loading={loading}
              showPreview={showPreview}
              format={format}
              code={code}
              engine={engine}
            />
          </div>
        </div>
      </main>
    </ErrorBoundary>
  );
}
