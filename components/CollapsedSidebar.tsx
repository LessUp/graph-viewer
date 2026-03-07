'use client';

import { ChevronsRight, Plus } from 'lucide-react';

export type CollapsedSidebarProps = {
  diagramCount: number;
  onExpand: () => void;
  onCreate: () => void;
};

export function CollapsedSidebar({ diagramCount, onExpand, onCreate }: CollapsedSidebarProps) {
  return (
    <div className="hidden h-full flex-col items-center gap-2 rounded-[24px] border border-white/70 bg-white/90 p-2 shadow-sm backdrop-blur lg:flex">
      <button
        onClick={onExpand}
        className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
        title="展开侧边栏"
      >
        <ChevronsRight className="h-4 w-4" />
      </button>
      <div className="h-px w-full bg-slate-100"></div>
      <button
        onClick={onCreate}
        className="flex h-9 w-9 items-center justify-center rounded-xl text-sky-600 transition hover:bg-sky-50"
        title="新建图表"
      >
        <Plus className="h-4 w-4" />
      </button>
      <span className="text-[10px] font-medium text-slate-400">{diagramCount}</span>
    </div>
  );
}
