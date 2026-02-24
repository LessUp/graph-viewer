
import { useState, useEffect, useRef, useCallback } from 'react';
import { exportSvg, exportPng, copyPngToClipboard, copySvgToClipboard, exportHtml, exportMarkdown, exportSourceCode } from '@/lib/exportUtils';
import { ZoomIn, ZoomOut, RotateCcw, Maximize, Download, Loader2, Check, Copy } from 'lucide-react';

interface PreviewToolbarProps {
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onFullscreen?: () => void;
  svgContent: string | null;
  code?: string;
  engine?: string;
  filename?: string;
}

export function PreviewToolbar({
  scale,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onFullscreen,
  svgContent,
  code = '',
  engine = 'mermaid',
  filename = 'diagram',
}: PreviewToolbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const showCopySuccess = useCallback(() => {
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  }, []);

  // Click outside to close menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = async (type: 'svg' | 'png' | 'copy' | 'html' | 'md' | 'source', pngScale = 2) => {
    if (!svgContent && type !== 'md' && type !== 'source') return;
    if (!code && (type === 'md' || type === 'source')) return;
    setIsExporting(true);
    setIsMenuOpen(false);

    try {
      if (type === 'svg') {
        exportSvg(svgContent!, filename);
      } else if (type === 'png') {
        await exportPng(svgContent!, filename, pngScale);
      } else if (type === 'copy') {
        await copyPngToClipboard(svgContent!, pngScale);
        showCopySuccess();
      } else if (type === 'html') {
        exportHtml(svgContent!, filename, filename);
      } else if (type === 'md') {
        exportMarkdown(code, engine, filename);
      } else if (type === 'source') {
        exportSourceCode(code, engine, filename);
      }
    } catch (e) {
      console.error('Export failed', e);
      alert('导出失败，请重试');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="absolute right-4 top-4 z-20 flex items-center gap-2 rounded-lg border border-slate-200 bg-white/90 p-1.5 shadow-sm backdrop-blur transition-opacity hover:bg-white">
      {/* Zoom Controls */}
      <div className="flex items-center gap-1 border-r border-slate-200 pr-2">
        <button
          onClick={onZoomOut}
          className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          title="缩小"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <span className="min-w-[3rem] text-center text-xs font-medium text-slate-600">
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={onZoomIn}
          className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          title="放大"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          onClick={onResetZoom}
          className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          title="重置视图"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
        {onFullscreen && (
          <button
            onClick={onFullscreen}
            className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            title="全屏查看"
          >
            <Maximize className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Copy Success Toast */}
      {copySuccess && (
        <div className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-600 ring-1 ring-emerald-200">
          <Check className="h-3.5 w-3.5" />
          已复制
        </div>
      )}

      {/* Export Menu */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          disabled={!svgContent || isExporting}
          className={`flex items-center gap-1.5 rounded px-2 py-1.5 text-xs font-medium transition-colors ${
            isMenuOpen ? 'bg-sky-50 text-sky-600' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isExporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          导出
        </button>

        {/* Dropdown */}
        {isMenuOpen && (
          <div className="absolute right-0 top-full mt-2 w-52 origin-top-right rounded-xl border border-slate-100 bg-white p-1.5 shadow-xl ring-1 ring-slate-200 focus:outline-none">
            {/* 图片格式 */}
            <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">图片格式</div>
            <button
              onClick={() => handleExport('svg')}
              className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-xs text-slate-700 hover:bg-slate-50 hover:text-sky-600"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded bg-orange-100 text-[0.6rem] font-bold text-orange-600">S</span>
              SVG 矢量图
            </button>
            <button
              onClick={() => handleExport('png', 2)}
              className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-xs text-slate-700 hover:bg-slate-50 hover:text-sky-600"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded bg-emerald-100 text-[0.6rem] font-bold text-emerald-600">P</span>
              PNG 高清 (2x)
            </button>
            <button
              onClick={() => handleExport('png', 4)}
              className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-xs text-slate-700 hover:bg-slate-50 hover:text-sky-600"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded bg-emerald-100 text-[0.6rem] font-bold text-emerald-600">P</span>
              PNG 超清 (4x)
            </button>
            
            <div className="my-1.5 h-px bg-slate-100" />
            
            {/* 文档格式 */}
            <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">文档格式</div>
            <button
              onClick={() => handleExport('html')}
              className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-xs text-slate-700 hover:bg-slate-50 hover:text-sky-600"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded bg-blue-100 text-[0.6rem] font-bold text-blue-600">H</span>
              HTML 网页
            </button>
            <button
              onClick={() => handleExport('md')}
              className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-xs text-slate-700 hover:bg-slate-50 hover:text-sky-600"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded bg-violet-100 text-[0.6rem] font-bold text-violet-600">M</span>
              Markdown 文档
            </button>
            <button
              onClick={() => handleExport('source')}
              className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-xs text-slate-700 hover:bg-slate-50 hover:text-sky-600"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-100 text-[0.6rem] font-bold text-slate-600">C</span>
              源代码文件
            </button>
            
            <div className="my-1.5 h-px bg-slate-100" />
            
            {/* 复制 */}
            <button
              onClick={() => handleExport('copy')}
              className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-xs text-slate-700 hover:bg-slate-50 hover:text-sky-600"
            >
              <Copy className="h-4 w-4 text-slate-500" />
              复制图片到剪贴板
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
