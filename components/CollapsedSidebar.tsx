'use client';

import { ChevronsRight, Plus } from 'lucide-react';

export type CollapsedSidebarProps = {
  diagramCount: number;
  onExpand: () => void;
  onCreate: () => void;
};

export function CollapsedSidebar({ diagramCount, onExpand, onCreate }: CollapsedSidebarProps) {
  return (
    <div className="hidden lg:flex flex-col items-center gap-2 rounded-2xl border border-slate-200/80 bg-white p-2 shadow-sm h-full">
      <button
        onClick={onExpand}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition"
        title="展开侧边栏"
      >
        <ChevronsRight className="h-4 w-4" />
      </button>
      <div className="w-full h-px bg-slate-100"></div>
      <button
        onClick={onCreate}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-sky-600 hover:bg-sky-50 transition"
        title="新建图表"
      >
        <Plus className="h-4 w-4" />
      </button>
      <span className="text-[10px] font-medium text-slate-400">{diagramCount}</span>
    </div>
  );
}
