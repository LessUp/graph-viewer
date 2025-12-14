'use client';

import { useState } from 'react';
import type { VersionRecord } from '@/hooks/useVersionHistory';

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
          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
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
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
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
            <svg className="h-12 w-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
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
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
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
                      <svg className={`h-4 w-4 transition ${expandedId === version.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onRestore(version)}
                      className="rounded p-1 text-slate-400 hover:bg-sky-100 hover:text-sky-600"
                      title="恢复此版本"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onDelete(version.id)}
                      className="rounded p-1 text-slate-400 hover:bg-rose-100 hover:text-rose-600"
                      title="删除此版本"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
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
