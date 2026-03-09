'use client';

import type { EditorPanelProps } from '@/components/EditorPanel';
import type { AIAssistantPanelProps } from '@/components/AIAssistantPanel';
import type { VersionHistoryPanelProps } from '@/components/VersionHistoryPanel';
import type { VersionRecord } from '@/hooks/useVersionHistory';
import { EditorPanel } from '@/components/EditorPanel';
import { AIAssistantPanel } from '@/components/AIAssistantPanel';
import { VersionHistoryPanel } from '@/components/VersionHistoryPanel';
import { Code2, Zap, Clock } from 'lucide-react';

export type SidebarTab = 'editor' | 'ai' | 'history';

export type SidebarTabsProps = {
  activeTab: SidebarTab;
  onTabChange: (tab: SidebarTab) => void;
  editorProps: EditorPanelProps;
  aiProps: AIAssistantPanelProps;
  historyProps: VersionHistoryPanelProps;
  versions: VersionRecord[];
};

const TAB_ITEMS: Array<{
  id: SidebarTab;
  label: string;
  icon: typeof Code2;
  activeClass: string;
}> = [
  {
    id: 'editor',
    label: '代码',
    icon: Code2,
    activeClass: 'rounded-xl bg-sky-50 text-sky-700 shadow-sm ring-1 ring-sky-100',
  },
  {
    id: 'ai',
    label: 'AI 助手',
    icon: Zap,
    activeClass: 'rounded-xl bg-violet-50 text-violet-700 shadow-sm ring-1 ring-violet-100',
  },
  {
    id: 'history',
    label: '历史',
    icon: Clock,
    activeClass: 'rounded-xl bg-amber-50 text-amber-700 shadow-sm ring-1 ring-amber-100',
  },
];

export function SidebarTabs(props: SidebarTabsProps) {
  const { activeTab, onTabChange, editorProps, aiProps, historyProps, versions } = props;

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
      <div className="min-h-[360px] flex-1 lg:min-h-0">
        {activeTab === 'editor' && <EditorPanel {...editorProps} />}
        {activeTab === 'ai' && (
          <div className="h-full overflow-hidden rounded-[24px] border border-white/70 bg-white/90 shadow-sm backdrop-blur">
            <AIAssistantPanel {...aiProps} />
          </div>
        )}
        {activeTab === 'history' && (
          <div className="h-full overflow-hidden rounded-[24px] border border-white/70 bg-white/90 shadow-sm backdrop-blur">
            <VersionHistoryPanel {...historyProps} />
          </div>
        )}
      </div>
    </>
  );
}
