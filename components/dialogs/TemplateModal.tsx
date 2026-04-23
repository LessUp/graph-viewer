'use client';

import { useState, useMemo } from 'react';
import { FileCode, X, AlertTriangle } from 'lucide-react';
import {
  type DiagramTemplate,
  type TemplateCategory,
  TEMPLATES,
  getTemplatesByEngines,
  getAvailableCategories,
} from '@/lib/diagramTemplates';
import type { Engine } from '@/lib/diagramConfig';

type TemplateModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreateFromTemplate: (template: DiagramTemplate) => void;
  limitEngines?: readonly Engine[];
};

export function TemplateModal({
  isOpen,
  onClose,
  onCreateFromTemplate,
  limitEngines,
}: TemplateModalProps) {
  // Filter templates based on engine limitations (for static export mode)
  const availableTemplates = useMemo(() => {
    if (limitEngines) {
      return getTemplatesByEngines(limitEngines);
    }
    return TEMPLATES;
  }, [limitEngines]);

  // Get categories that have available templates
  const availableCategories = useMemo(
    () => getAvailableCategories(availableTemplates),
    [availableTemplates],
  );

  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory['id']>(() => {
    // Default to first available category
    return availableCategories[0]?.id ?? 'flowchart';
  });

  const [selectedTemplate, setSelectedTemplate] = useState<DiagramTemplate | null>(null);

  // Reset selection when modal opens
  const handleOpen = () => {
    const firstCategory = availableCategories[0];
    if (firstCategory) {
      setSelectedCategory(firstCategory.id);
    }
    setSelectedTemplate(null);
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle create button
  const handleCreate = () => {
    if (selectedTemplate) {
      onCreateFromTemplate(selectedTemplate);
      onClose();
    }
  };

  // Filter templates by selected category
  const filteredTemplates = useMemo(
    () => availableTemplates.filter((t) => t.category === selectedCategory),
    [availableTemplates, selectedCategory],
  );

  if (!isOpen) return null;

  // Check if some templates were filtered out
  const hasFilteredTemplates = limitEngines && TEMPLATES.length > availableTemplates.length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={handleBackdropClick}
      onMouseEnter={handleOpen}
    >
      <div className="animate-fade-in flex h-[80vh] max-h-[600px] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100">
              <FileCode className="h-5 w-5 text-sky-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">从模板创建</h2>
              <p className="text-xs text-slate-400">选择一个模板快速开始</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Static export notice */}
        {hasFilteredTemplates && (
          <div className="flex flex-shrink-0 items-center gap-2 border-b border-amber-100 bg-amber-50 px-6 py-2 text-xs text-amber-700">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>演示版仅支持本地渲染引擎，部分模板不可用。部署完整版可解锁全部模板。</span>
          </div>
        )}

        {/* Category Tabs */}
        <div className="flex flex-shrink-0 gap-1 overflow-x-auto border-b border-slate-100 px-6 py-3">
          {availableCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                setSelectedCategory(category.id);
                setSelectedTemplate(null);
              }}
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                selectedCategory === category.id
                  ? 'bg-sky-100 text-sky-700'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Content: Template List + Preview */}
        <div className="flex min-h-0 flex-1">
          {/* Template List */}
          <div className="w-1/2 overflow-y-auto border-r border-slate-100 p-4">
            {filteredTemplates.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">
                该分类下暂无可用模板
              </div>
            ) : (
              <div className="space-y-2">
                {filteredTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template)}
                    className={`w-full rounded-xl border p-3 text-left transition ${
                      selectedTemplate?.id === template.id
                        ? 'border-sky-300 bg-sky-50 ring-1 ring-sky-200'
                        : 'border-slate-100 bg-slate-50/50 hover:border-slate-200 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-slate-700">{template.name}</span>
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                        {template.engine}
                      </span>
                    </div>
                    {template.description && (
                      <p className="mt-1 text-xs text-slate-400">{template.description}</p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Code Preview */}
          <div className="flex w-1/2 flex-col bg-slate-50 p-4">
            <div className="mb-2 text-xs font-medium text-slate-500">代码预览</div>
            {selectedTemplate ? (
              <div className="flex-1 overflow-hidden rounded-xl border border-slate-200 bg-slate-900">
                <pre className="h-full overflow-auto p-4 text-xs leading-relaxed text-slate-300">
                  <code>{selectedTemplate.code}</code>
                </pre>
              </div>
            ) : (
              <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-slate-200">
                <p className="text-sm text-slate-400">选择模板查看预览</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-shrink-0 justify-end gap-3 border-t border-slate-100 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
          >
            取消
          </button>
          <button
            onClick={handleCreate}
            disabled={!selectedTemplate}
            className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            创建图表
          </button>
        </div>
      </div>
    </div>
  );
}
