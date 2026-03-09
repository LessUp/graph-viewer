'use client';

import { useMemo, type MouseEvent as ReactMouseEvent } from 'react';
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
  const sortedDiagrams = useMemo(
    () =>
      [...diagrams].sort((a, b) => {
        const ta = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const tb = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        return tb - ta;
      }),
    [diagrams],
  );

  return (
    <div className="flex-shrink-0 overflow-hidden rounded-[24px] border border-white/70 bg-white/85 p-4 shadow-sm backdrop-blur">
      <div className="mb-4 flex items-center justify-between">
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
            className="flex items-center gap-1.5 rounded-xl bg-sky-50 px-3 py-1.5 text-xs font-medium text-sky-600 transition hover:bg-sky-100"
          >
            <Plus className="h-3.5 w-3.5" />
            新建
          </button>
          <button
            onClick={onCollapseSidebar}
            className="hidden h-8 w-8 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 lg:flex"
            title="收起侧边栏"
          >
            <ChevronsLeft className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 lg:max-h-[220px] lg:flex-col lg:overflow-y-auto lg:pr-1 xl:max-h-[280px]">
        {sortedDiagrams.map((d) => (
          <div
            key={d.id}
            onClick={() => onSelect(d.id)}
            className={`group flex shrink-0 cursor-pointer items-center justify-between gap-2 rounded-2xl border px-3.5 py-2.5 transition-all ${
              d.id === currentId
                ? 'border-sky-300 bg-sky-50/90 text-sky-700 shadow-sm ring-1 ring-sky-100'
                : 'border-slate-100 bg-slate-50/60 text-slate-600 hover:border-slate-200 hover:bg-white'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div
                className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${d.id === currentId ? 'bg-sky-500' : 'bg-slate-300'}`}
              ></div>
              <span className="truncate text-xs font-medium">{d.name}</span>
            </div>
            <div className="flex items-center gap-0.5 opacity-100 transition lg:opacity-0 lg:group-hover:opacity-100">
              <button
                onClick={(e: ReactMouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation();
                  onRename(d.id, d.name);
                }}
                className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                title="重命名"
              >
                <Pencil className="h-3 w-3" />
              </button>
              <button
                onClick={(e: ReactMouseEvent<HTMLButtonElement>) => {
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
