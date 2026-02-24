
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { EditorPanel } from '@/components/EditorPanel';
import { PreviewPanel } from '@/components/PreviewPanel';
import { SettingsModal } from '@/components/SettingsModal';
import { Toast } from '@/components/Toast';
import { AppHeader } from '@/components/AppHeader';
import { DiagramList } from '@/components/DiagramList';
import { CollapsedSidebar } from '@/components/CollapsedSidebar';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useDiagramState } from '@/hooks/useDiagramState';
import { useDiagramRender } from '@/hooks/useDiagramRender';
import { useSettings } from '@/hooks/useSettings';
import { useToast } from '@/hooks/useToast';
import { SAMPLES } from '@/lib/diagramSamples';

export default function Page() {
  const {
    engine,
    code,
    codeStats,
    linkError,
    diagrams,
    currentId,
    setEngine,
    setCode,
    setCurrentId,
    createDiagram,
    renameDiagram,
    deleteDiagram,
    importWorkspace,
  } = useDiagramState(SAMPLES['mermaid']);

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
  );

  const [livePreview, setLivePreview] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const debounceRef = useRef<number | null>(null);
  const { toast, showToast } = useToast();

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
    debounceRef.current = window.setTimeout(() => void renderDiagram(), 800);
    return () => {
      if (debounceRef.current !== null) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    };
  }, [livePreview, engine, code, renderDiagram, resetOutput]);

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
    } catch (e: any) {
      setError(e?.message || '复制代码失败');
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
    } catch (e: any) {
      setError(e?.message || '导出项目集失败');
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

  return (
    <ErrorBoundary>
      <main className="relative isolate mx-auto flex min-h-screen w-full max-w-[1800px] flex-col gap-5 px-4 py-4 md:px-6 lg:gap-5 lg:py-5">
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
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:h-[calc(100vh-140px)]">
          {/* Left Sidebar */}
          <div
            className={`flex flex-col gap-4 lg:h-full lg:shrink-0 transition-all duration-300 ${
              settings.sidebarCollapsed ? 'lg:w-12' : 'w-full lg:w-[460px]'
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
                    onEngineChange={handleEngineChange}
                    onCodeChange={setCode}
                    onRender={renderDiagram}
                    onCopyCode={handleCopyCode}
                    onClearCode={handleClearCode}
                  />
                </div>
              </>
            )}
          </div>

          {/* Right: Preview */}
          <div className="flex-1 h-[500px] lg:h-full">
            <PreviewPanel
              svg={svg}
              base64={base64}
              contentType={contentType}
              loading={loading}
              showPreview={showPreview}
              format="svg"
              code={code}
              engine={engine}
            />
          </div>
        </div>
      </main>
    </ErrorBoundary>
  );
}
