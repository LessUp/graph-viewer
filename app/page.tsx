'use client';

import { useState } from 'react';
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
import { useVersionHistory } from '@/hooks/useVersionHistory';
import { useWorkspaceActions } from '@/hooks/useWorkspaceActions';
import { useLivePreview } from '@/hooks/useLivePreview';
import { useAIActions } from '@/hooks/useAIActions';
import { useVersionActions } from '@/hooks/useVersionActions';
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

  const [showSettings, setShowSettings] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('editor');
  const { toast, showToast } = useToast();

  const combinedError = error || linkError;

  // --- 组合 hooks ---

  const { livePreview, setLivePreview } = useLivePreview({
    engine,
    code,
    debounceMs: settings.debounceMs,
    renderDiagram,
    resetOutput,
  });

  const {
    handleCopyCode,
    handleClearCode,
    handleSelectDiagram,
    handleCreateDiagram,
    handleRenameDiagram,
    handleDeleteDiagram,
    handleExportWorkspace,
    handleEngineChange,
  } = useWorkspaceActions({
    engine,
    code,
    currentId,
    diagrams,
    setCode,
    setEngine,
    resetOutput,
    createDiagram,
    renameDiagram,
    deleteDiagram,
    setCurrentId,
    clearError,
    setError,
    showToast,
  });

  const {
    config: aiConfig,
    updateConfig: updateAIConfig,
    state: aiState,
    clearError: clearAIError,
    clearAnalysis: clearAIAnalysis,
    isConfigured: isAIConfigured,
    analyzeCode,
    generateCode,
    fixCode,
  } = useAIAssistant(engine);

  const { handleAIAnalyze, handleAIFix, handleAIGenerate, handleAIApplyCode } = useAIActions({
    code,
    combinedError,
    analyzeCode,
    fixCode,
    generateCode,
    setCode,
    setSidebarTab,
    showToast,
  });

  const {
    versions,
    isLoading: isVersionsLoading,
    createVersion,
    deleteVersion,
    renameVersion,
    clearDiagramVersions,
  } = useVersionHistory(currentId, code, engine);

  const { handleCreateSnapshot, handleRestoreVersion, handleClearVersions } = useVersionActions({
    createVersion,
    clearDiagramVersions,
    setCode,
    setEngine,
    showToast,
  });

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
          <div className="min-h-[420px] flex-1 lg:h-full lg:min-h-0">
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
