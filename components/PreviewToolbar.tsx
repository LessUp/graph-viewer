
import { useState, useEffect, useRef } from 'react';
import { exportSvg, exportPng, copyPngToClipboard, copySvgToClipboard, exportImage, EXPORT_PRESETS, type ExportPreset } from '@/lib/exportUtils';

interface PreviewToolbarProps {
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onFitToScreen?: () => void;
  svgContent: string | null;
  filename?: string;
}

export function PreviewToolbar({
  scale,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  svgContent,
  filename = 'diagram',
}: PreviewToolbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  const handleExport = async (type: 'svg' | 'png' | 'copy', pngScale = 2) => {
    if (!svgContent) return;
    setIsExporting(true);
    setIsMenuOpen(false); // Close menu immediately

    try {
      if (type === 'svg') {
        exportSvg(svgContent, filename);
      } else if (type === 'png') {
        await exportPng(svgContent, filename, pngScale);
      } else if (type === 'copy') {
        await copyPngToClipboard(svgContent, pngScale);
        // Could add a toast notification here
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
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            <line x1="8" y1="11" x2="14" y2="11"></line>
          </svg>
        </button>
        <span className="min-w-[3rem] text-center text-xs font-medium text-slate-600">
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={onZoomIn}
          className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          title="放大"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            <line x1="11" y1="8" x2="11" y2="14"></line>
            <line x1="8" y1="11" x2="14" y2="11"></line>
          </svg>
        </button>
        <button
          onClick={onResetZoom}
          className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          title="重置视图"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
            <path d="M3 3v5h5"></path>
          </svg>
        </button>
      </div>

      {/* Export Menu */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          disabled={!svgContent || isExporting}
          className={`flex items-center gap-1.5 rounded px-2 py-1.5 text-xs font-medium transition-colors ${
            isMenuOpen ? 'bg-sky-50 text-sky-600' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          {isExporting ? (
             <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
             </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
          )}
          导出
        </button>

        {/* Dropdown */}
        {isMenuOpen && (
          <div className="absolute right-0 top-full mt-2 w-48 origin-top-right rounded-xl border border-slate-100 bg-white p-1 shadow-xl ring-1 ring-slate-200 focus:outline-none">
            <div className="px-2 py-1.5 text-xs font-semibold text-slate-400">下载文件</div>
            <button
              onClick={() => handleExport('svg')}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 hover:text-sky-600"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded bg-orange-100 text-[0.6rem] font-bold text-orange-600">S</span>
              SVG 矢量图
            </button>
            <button
              onClick={() => handleExport('png', 2)}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 hover:text-sky-600"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded bg-emerald-100 text-[0.6rem] font-bold text-emerald-600">P</span>
              PNG 图片 (高清 2x)
            </button>
            <button
              onClick={() => handleExport('png', 4)}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 hover:text-sky-600"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded bg-emerald-100 text-[0.6rem] font-bold text-emerald-600">P</span>
              PNG 图片 (超清 4x)
            </button>
            
            <div className="my-1 h-px bg-slate-100" />
            
            <button
              onClick={() => handleExport('copy')}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 hover:text-sky-600"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              复制图片到剪贴板
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
