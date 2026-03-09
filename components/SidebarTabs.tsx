'use client';

import type { Engine, Format } from '@/lib/diagramConfig';
import type { AIConfig, AIAnalysisResult } from '@/hooks/useAIAssistant';
import type { VersionRecord } from '@/hooks/useVersionHistory';
import { EditorPanel } from '@/components/EditorPanel';
import { AIAssistantPanel } from '@/components/AIAssistantPanel';
import { VersionHistoryPanel } from '@/components/VersionHistoryPanel';
import { Code2, Zap, Clock } from 'lucide-react';

export type SidebarTab = 'editor' | 'ai' | 'history';

export type SidebarTabsProps = {
  activeTab: SidebarTab;
  onTabChange: (tab: SidebarTab) => void;
  // Editor props
  engine: Engine;
  format: Format;
  code: string;
  codeStats: { lines: number; chars: number };
  loading: boolean;
  error: string;
  canUseLocalRender: boolean;
  livePreviewEnabled: boolean;
  onLivePreviewChange: (enabled: boolean) => void;
  onEngineChange: (engine: Engine, loadSample?: boolean) => void;
  onFormatChange: (format: Format) => void;
  onCodeChange: (code: string) => void;
  onRender: () => Promise<void> | void;
  onCopyCode: () => Promise<void> | void;
  onClearCode: () => void;
  editorFontSize?: number;
  // AI props
  aiConfig: AIConfig;
  isAIConfigured: boolean;
  isAnalyzing: boolean;
  isGenerating: boolean;
  lastAnalysis: AIAnalysisResult | null;
  aiError: string | null;
  onUpdateAIConfig: (config: Partial<AIConfig>) => void;
  onAIAnalyze: () => void;
  onAIFix: () => void;
  onAIGenerate: (description: string) => void;
  onAIApplyCode: (code: string) => void;
  onClearAIError: () => void;
  onClearAIAnalysis: () => void;
  // Version history props
  versions: VersionRecord[];
  isVersionsLoading: boolean;
  onRestoreVersion: (version: VersionRecord) => void;
  onDeleteVersion: (versionId: string) => void;
  onRenameVersion: (versionId: string, newLabel: string) => void;
  onCreateSnapshot: () => void;
  onClearVersions: () => void;
};

const TAB_ITEMS: Array<{
  id: SidebarTab;
  label: string;
  icon: typeof Code2;
  activeClass: string;
}> = [
  { id: 'editor', label: '代码', icon: Code2, activeClass: 'rounded-xl bg-sky-50 text-sky-700 shadow-sm ring-1 ring-sky-100' },
  { id: 'ai', label: 'AI 助手', icon: Zap, activeClass: 'rounded-xl bg-violet-50 text-violet-700 shadow-sm ring-1 ring-violet-100' },
  { id: 'history', label: '历史', icon: Clock, activeClass: 'rounded-xl bg-amber-50 text-amber-700 shadow-sm ring-1 ring-amber-100' },
];

export function SidebarTabs(props: SidebarTabsProps) {
  const { activeTab, onTabChange, versions } = props;

  return (
    <>
      {/* Tab 切换栏 */}
      <div className="flex overflow-hidden rounded-2xl border border-slate-200/70 bg-white/80 p-1 shadow-sm backdrop-blur">
        {TAB_ITEMS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-1 items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium transition ${
                isActive ? tab.activeClass : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
              {tab.id === 'history' && versions.length > 0 && (
                <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                  {versions.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 内容区 */}
      <div className="flex-1 min-h-[360px] lg:min-h-0">
        {activeTab === 'editor' && (
          <EditorPanel
            engine={props.engine}
            format={props.format}
            code={props.code}
            codeStats={props.codeStats}
            loading={props.loading}
            error={props.error}
            canUseLocalRender={props.canUseLocalRender}
            livePreviewEnabled={props.livePreviewEnabled}
            onLivePreviewChange={props.onLivePreviewChange}
            onEngineChange={props.onEngineChange}
            onFormatChange={props.onFormatChange}
            onCodeChange={props.onCodeChange}
            onRender={props.onRender}
            onCopyCode={props.onCopyCode}
            onClearCode={props.onClearCode}
            editorFontSize={props.editorFontSize}
          />
        )}
        {activeTab === 'ai' && (
          <div className="h-full overflow-hidden rounded-[24px] border border-white/70 bg-white/90 shadow-sm backdrop-blur">
            <AIAssistantPanel
              config={props.aiConfig}
              isConfigured={props.isAIConfigured}
              isAnalyzing={props.isAnalyzing}
              isGenerating={props.isGenerating}
              lastAnalysis={props.lastAnalysis}
              error={props.aiError}
              onUpdateConfig={props.onUpdateAIConfig}
              onAnalyze={props.onAIAnalyze}
              onFix={props.onAIFix}
              onGenerate={props.onAIGenerate}
              onApplyCode={props.onAIApplyCode}
              onClearError={props.onClearAIError}
              onClearAnalysis={props.onClearAIAnalysis}
            />
          </div>
        )}
        {activeTab === 'history' && (
          <div className="h-full overflow-hidden rounded-[24px] border border-white/70 bg-white/90 shadow-sm backdrop-blur">
            <VersionHistoryPanel
              versions={props.versions}
              isLoading={props.isVersionsLoading}
              onRestore={props.onRestoreVersion}
              onDelete={props.onDeleteVersion}
              onRename={props.onRenameVersion}
              onCreateSnapshot={props.onCreateSnapshot}
              onClearAll={props.onClearVersions}
            />
          </div>
        )}
      </div>
    </>
  );
}
