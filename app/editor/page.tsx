'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { PreviewPanel } from '@/components/preview/PreviewPanel';
import { SettingsModal } from '@/components/dialogs/SettingsModal';
import { TemplateModal } from '@/components/dialogs/TemplateModal';
import { Toast } from '@/components/feedback/Toast';
import { AppHeader } from '@/components/layout/AppHeader';
import { DiagramList } from '@/components/sidebar/DiagramList';
import { CollapsedSidebar } from '@/components/layout/CollapsedSidebar';
import { ErrorBoundary } from '@/components/layout/ErrorBoundary';
import { SidebarTabs, type SidebarTab } from '@/components/sidebar/SidebarTabs';
import { ConfirmDialog, PromptDialog, AlertDialog } from '@/components/dialogs/Dialogs';
import { StaticExportNotice } from '@/components/landing/StaticExportNotice';
import { useDiagramState } from '@/hooks/useDiagramState';
import { useDiagramRender } from '@/hooks/useDiagramRender';
import { useSettings } from '@/hooks/useSettings';
import { useToast } from '@/hooks/useToast';
import { getAIBoundaryNotice, useAIAssistant } from '@/hooks/useAIAssistant';
import { useVersionHistory } from '@/hooks/useVersionHistory';
import { useWorkspaceActions } from '@/hooks/useWorkspaceActions';
import { useLivePreview } from '@/hooks/useLivePreview';
import { useAIActions } from '@/hooks/useAIActions';
import { useVersionActions } from '@/hooks/useVersionActions';
import { SAMPLES } from '@/lib/diagramSamples';
import { Loader2, ArrowLeft } from 'lucide-react';

const isStaticExport = process.env.NEXT_PUBLIC_STATIC_EXPORT === 'true';

function LoadingScreen() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
        <span className="text-sm text-slate-500">加载中...</span>
      </div>
    </main>
  );
}

export default function EditorPage() {
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

  // 在静态导出模式下禁用远程渲染
  const remoteRenderingEnabled = !isStaticExport;

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
    remoteRenderingEnabled,
  );

  const [showSettings, setShowSettings] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('editor');
  const { toast, showToast } = useToast();

  // 对话框状态
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    options: { title: string; message: string; variant?: 'default' | 'danger' };
    resolve: (value: boolean) => void;
  } | null>(null);

  const [promptDialog, setPromptDialog] = useState<{
    isOpen: boolean;
    options: { title: string; message: string; defaultValue: string };
    resolve: (value: string | null) => void;
  } | null>(null);

  const [alertDialog, setAlertDialog] = useState<{
    isOpen: boolean;
    options: { title: string; message: string };
  } | null>(null);

  // 对话框回调函数
  const showConfirm = useCallback(
    (options: {
      title: string;
      message: string;
      variant?: 'default' | 'danger';
    }): Promise<boolean> => {
      return new Promise((resolve) => {
        setConfirmDialog({ isOpen: true, options, resolve });
      });
    },
    [],
  );

  const showPrompt = useCallback(
    (options: { title: string; message: string; defaultValue: string }): Promise<string | null> => {
      return new Promise((resolve) => {
        setPromptDialog({ isOpen: true, options, resolve });
      });
    },
    [],
  );

  const showAlertDialog = useCallback((options: { title: string; message: string }) => {
    setAlertDialog({ isOpen: true, options });
  }, []);

  const pageError = error || linkError;

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
    handleExportSourceCode,
    handleEngineChange,
    handleCreateFromTemplate,
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
    showPrompt,
    showConfirm,
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
    combinedError: pageError,
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
    showConfirm,
  });

  // 水合加载状态
  if (!hasHydrated || !settingsLoaded) {
    return <LoadingScreen />;
  }

  const editorProps = {
    engine,
    format,
    code,
    codeStats,
    loading,
    error: pageError,
    canUseLocalRender,
    livePreviewEnabled: livePreview,
    onLivePreviewChange: setLivePreview,
    onEngineChange: handleEngineChange,
    onFormatChange: setFormat,
    onCodeChange: setCode,
    onRender: renderDiagram,
    onCopyCode: handleCopyCode,
    onClearCode: handleClearCode,
    onExportSourceCode: handleExportSourceCode,
    editorFontSize: settings.editorFontSize,
    // 静态导出模式下限制引擎选择
    limitEngines: isStaticExport ? (['mermaid', 'graphviz', 'flowchart'] as const) : undefined,
  };

  const aiProps = {
    config: aiConfig,
    isConfigured: isAIConfigured,
    isAnalyzing: aiState.isAnalyzing,
    isGenerating: aiState.isGenerating,
    lastAnalysis: aiState.lastAnalysis,
    error: aiState.error,
    boundaryNotice: getAIBoundaryNotice(),
    onUpdateConfig: updateAIConfig,
    onAnalyze: handleAIAnalyze,
    onFix: handleAIFix,
    onGenerate: handleAIGenerate,
    onApplyCode: handleAIApplyCode,
    onClearError: clearAIError,
    onClearAnalysis: clearAIAnalysis,
  };

  const historyProps = {
    versions,
    isLoading: isVersionsLoading,
    onRestore: handleRestoreVersion,
    onDelete: deleteVersion,
    onRename: renameVersion,
    onCreateSnapshot: handleCreateSnapshot,
    onClearAll: handleClearVersions,
  };

  const previewProps = {
    svg,
    base64,
    contentType,
    loading,
    showPreview,
    format,
    error: pageError,
    code,
    engine,
    onExportError: (message: string) => showAlertDialog({ title: '导出失败', message }),
  };

  const settingsModalProps = {
    isOpen: showSettings,
    onClose: () => setShowSettings(false),
    settings,
    onSave: saveSettings,
    remoteRenderingEnabled,
    isStaticExport,
  };

  const headerProps = {
    onImportWorkspace: importWorkspace,
    onExportWorkspace: handleExportWorkspace,
    onOpenSettings: () => setShowSettings(true),
    onError: setError,
  };

  const diagramListProps = {
    diagrams,
    currentId,
    onSelect: handleSelectDiagram,
    onCreate: handleCreateDiagram,
    onRename: handleRenameDiagram,
    onDelete: handleDeleteDiagram,
    onCollapseSidebar: toggleSidebar,
    onOpenTemplateModal: () => setShowTemplateModal(true),
  };

  const collapsedSidebarProps = {
    diagramCount: diagrams.length,
    onExpand: toggleSidebar,
    onCreate: handleCreateDiagram,
  };

  const sidebarTabsProps = {
    activeTab: sidebarTab,
    onTabChange: setSidebarTab,
    versions,
    editorProps,
    aiProps,
    historyProps,
  };

  return (
    <ErrorBoundary>
      <main className="relative isolate mx-auto flex min-h-screen w-full max-w-[1920px] flex-col gap-4 px-3 py-3 sm:px-4 sm:py-4 md:px-6 lg:gap-4 lg:py-5">
        <Toast toast={toast} />
        <SettingsModal {...settingsModalProps} />
        <TemplateModal
          isOpen={showTemplateModal}
          onClose={() => setShowTemplateModal(false)}
          onCreateFromTemplate={handleCreateFromTemplate}
          limitEngines={
            isStaticExport ? (['mermaid', 'graphviz', 'flowchart'] as const) : undefined
          }
        />

        {/* 对话框 */}
        <ConfirmDialog
          isOpen={confirmDialog?.isOpen ?? false}
          options={confirmDialog?.options ?? { title: '', message: '' }}
          onConfirm={() => {
            confirmDialog?.resolve(true);
            setConfirmDialog(null);
          }}
          onCancel={() => {
            confirmDialog?.resolve(false);
            setConfirmDialog(null);
          }}
        />
        <PromptDialog
          isOpen={promptDialog?.isOpen ?? false}
          options={promptDialog?.options ?? { title: '', message: '', defaultValue: '' }}
          onConfirm={(value) => {
            promptDialog?.resolve(value);
            setPromptDialog(null);
          }}
          onCancel={() => {
            promptDialog?.resolve(null);
            setPromptDialog(null);
          }}
        />
        <AlertDialog
          isOpen={alertDialog?.isOpen ?? false}
          options={alertDialog?.options ?? { title: '', message: '' }}
          onClose={() => setAlertDialog(null)}
        />

        {/* 静态导出提示 */}
        {isStaticExport && <StaticExportNotice />}

        {/* 返回首页链接（仅在静态导出时显示） */}
        {isStaticExport && (
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="flex items-center gap-1 text-sm font-medium text-slate-600 transition-colors hover:text-sky-600"
            >
              <ArrowLeft className="h-4 w-4" />
              返回首页
            </Link>
          </div>
        )}

        <AppHeader {...headerProps} />

        {/* Workspace Section */}
        <div className="flex flex-col gap-4 lg:h-[calc(100vh-150px)] lg:flex-row lg:items-stretch lg:gap-5">
          {/* Left Sidebar */}
          <div
            className={`flex min-h-0 flex-col gap-4 transition-all duration-300 ${
              settings.sidebarCollapsed ? 'lg:w-14' : 'w-full lg:w-[430px] xl:w-[470px]'
            }`}
          >
            {settings.sidebarCollapsed ? (
              <CollapsedSidebar {...collapsedSidebarProps} />
            ) : (
              <>
                <DiagramList {...diagramListProps} />

                <SidebarTabs {...sidebarTabsProps} />
              </>
            )}
          </div>

          {/* Right: Preview */}
          <div className="min-h-[420px] flex-1 lg:h-full lg:min-h-0">
            <PreviewPanel {...previewProps} />
          </div>
        </div>
      </main>
    </ErrorBoundary>
  );
}
