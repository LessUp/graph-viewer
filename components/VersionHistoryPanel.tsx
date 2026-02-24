'use client';

import { useState } from 'react';
import type { VersionRecord } from '@/hooks/useVersionHistory';
import { Loader2, Clock, Plus, Pencil, ChevronDown, RotateCcw, Trash2 } from 'lucide-react';

export type VersionHistoryPanelProps = {
  versions: VersionRecord[];
  isLoading: boolean;
  onRestore: (version: VersionRecord) => void;
  onDelete: (versionId: string) => void;
  onRename: (versionId: string, newLabel: string) => void;
  onCreateSnapshot: () => void;
  onClearAll: () => void;
};

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  // 不到1分钟
  if (diff < 60000) {
    return '刚刚';
  }
  
  // 不到1小时
  if (diff < 3600000) {
    return `${Math.floor(diff / 60000)} 分钟前`;
  }
  
  // 不到24小时
  if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)} 小时前`;
  }
  
  // 不到7天
  if (diff < 604800000) {
    return `${Math.floor(diff / 86400000)} 天前`;
  }
  
  // 显示具体日期
  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function truncateCode(code: string, maxLength = 100): string {
  if (code.length <= maxLength) return code;
  return code.slice(0, maxLength) + '...';
}

export function VersionHistoryPanel(props: VersionHistoryPanelProps) {
  const {
    versions,
    isLoading,
    onRestore,
    onDelete,
    onRename,
    onCreateSnapshot,
    onClearAll,
  } = props;

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');

  const handleStartEdit = (version: VersionRecord) => {
    setEditingId(version.id);
    setEditLabel(version.label || '');
  };

  const handleSaveEdit = (versionId: string) => {
    onRename(versionId, editLabel);
    setEditingId(null);
    setEditLabel('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditLabel('');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-2 text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">加载中...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* 头部操作栏 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
        <h3 className="text-sm font-semibold text-slate-700">版本历史</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={onCreateSnapshot}
            className="flex items-center gap-1 rounded-lg bg-sky-50 px-2.5 py-1.5 text-xs font-medium text-sky-600 hover:bg-sky-100 transition"
          >
            <Plus className="h-3.5 w-3.5" />
            创建快照
          </button>
          {versions.length > 0 && (
            <button
              onClick={onClearAll}
              className="rounded-lg px-2 py-1.5 text-xs text-slate-500 hover:bg-slate-100 hover:text-rose-600 transition"
            >
              清空
            </button>
          )}
        </div>
      </div>

      {/* 版本列表 */}
      <div className="flex-1 overflow-y-auto">
        {versions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <Clock className="h-12 w-12 mb-3" strokeWidth={1.5} />
            <p className="text-sm">暂无版本历史</p>
            <p className="text-xs mt-1">系统会自动保存您的修改</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {versions.map((version, index) => (
              <div
                key={version.id}
                className={`group px-4 py-3 hover:bg-slate-50 transition ${
                  expandedId === version.id ? 'bg-slate-50' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    {/* 版本标签 */}
                    {editingId === version.id ? (
                      <div className="flex items-center gap-2 mb-1">
                        <input
                          type="text"
                          value={editLabel}
                          onChange={(e) => setEditLabel(e.target.value)}
                          placeholder="输入版本标签"
                          className="flex-1 rounded border border-slate-300 px-2 py-1 text-xs focus:border-sky-500 focus:outline-none"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit(version.id);
                            if (e.key === 'Escape') handleCancelEdit();
                          }}
                        />
                        <button
                          onClick={() => handleSaveEdit(version.id)}
                          className="text-xs text-sky-600 hover:text-sky-700"
                        >
                          保存
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="text-xs text-slate-400 hover:text-slate-600"
                        >
                          取消
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-slate-700">
                          {version.label || (index === 0 ? '当前版本' : `版本 ${versions.length - index}`)}
                        </span>
                        {version.autoSave && (
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">
                            自动
                          </span>
                        )}
                        <button
                          onClick={() => handleStartEdit(version)}
                          className="hidden group-hover:block text-slate-400 hover:text-slate-600"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                      </div>
                    )}

                    {/* 时间和引擎 */}
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span>{formatTimestamp(version.timestamp)}</span>
                      <span>·</span>
                      <span>{version.engine}</span>
                      <span>·</span>
                      <span>{version.code.split('\n').length} 行</span>
                    </div>

                    {/* 代码预览 */}
                    {expandedId === version.id && (
                      <div className="mt-2 rounded bg-slate-100 p-2 text-[11px] font-mono text-slate-600 whitespace-pre-wrap max-h-40 overflow-y-auto">
                        {version.code}
                      </div>
                    )}
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => setExpandedId(expandedId === version.id ? null : version.id)}
                      className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                      title={expandedId === version.id ? '收起' : '展开'}
                    >
                      <ChevronDown className={`h-4 w-4 transition ${expandedId === version.id ? 'rotate-180' : ''}`} />
                    </button>
                    <button
                      onClick={() => onRestore(version)}
                      className="rounded p-1 text-slate-400 hover:bg-sky-100 hover:text-sky-600"
                      title="恢复此版本"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(version.id)}
                      className="rounded p-1 text-slate-400 hover:bg-rose-100 hover:text-rose-600"
                      title="删除此版本"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 底部统计 */}
      {versions.length > 0 && (
        <div className="px-4 py-2 border-t border-slate-200 text-[11px] text-slate-400">
          共 {versions.length} 个版本 · 
          {versions.filter(v => !v.autoSave).length} 个手动保存
        </div>
      )}
    </div>
  );
}

export default VersionHistoryPanel;
