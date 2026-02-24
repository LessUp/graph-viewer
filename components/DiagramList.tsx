'use client';

import { Plus, ChevronsLeft, Layers, Pencil, Trash2 } from 'lucide-react';

export type DiagramEntry = {
  id: string;
  name: string;
  updatedAt?: string;
};

export type DiagramListProps = {
  diagrams: DiagramEntry[];
  currentId: string;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onRename: (id: string, currentName: string) => void;
  onDelete: (id: string, name: string) => void;
  onCollapseSidebar: () => void;
};

export function DiagramList({
  diagrams,
  currentId,
  onSelect,
  onCreate,
  onRename,
  onDelete,
  onCollapseSidebar,
}: DiagramListProps) {
  const sortedDiagrams = [...diagrams].sort((a, b) => {
    const ta = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
    const tb = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
    return tb - ta;
  });

  return (
    <div className="flex-shrink-0 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100">
            <Layers className="h-3.5 w-3.5 text-slate-500" />
          </div>
          <span className="text-sm font-semibold text-slate-700">我的图表</span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
            {diagrams.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onCreate}
            className="flex items-center gap-1.5 rounded-lg bg-sky-50 px-2.5 py-1.5 text-xs font-medium text-sky-600 hover:bg-sky-100 transition"
          >
            <Plus className="h-3.5 w-3.5" />
            新建
          </button>
          <button
            onClick={onCollapseSidebar}
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
            onClick={() => onSelect(d.id)}
            className={`group flex shrink-0 cursor-pointer items-center justify-between gap-2 rounded-xl border px-3 py-2 transition-all ${
              d.id === currentId
                ? 'border-sky-400 bg-sky-50 text-sky-700'
                : 'border-slate-100 bg-slate-50/50 text-slate-600 hover:border-slate-200 hover:bg-white'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div
                className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${d.id === currentId ? 'bg-sky-500' : 'bg-slate-300'}`}
              ></div>
              <span className="truncate text-xs font-medium">{d.name}</span>
            </div>
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRename(d.id, d.name);
                }}
                className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                title="重命名"
              >
                <Pencil className="h-3 w-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(d.id, d.name);
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
  );
}
