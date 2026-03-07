'use client';

import { useEffect, useMemo, useRef, useState, type MouseEvent, type WheelEvent } from 'react';
import DOMPurify from 'dompurify';
import { PreviewToolbar } from '@/components/PreviewToolbar';
import { ENGINE_LABELS, FORMAT_LABELS, type Engine, type Format } from '@/lib/diagramConfig';
import { Loader2, X, Image as ImageIcon } from 'lucide-react';

export type PreviewPanelProps = {
  svg: string;
  base64: string;
  contentType: string;
  loading: boolean;
  showPreview: boolean;
  format: Format;
  code?: string;
  engine?: Engine;
};

export function PreviewPanel(props: PreviewPanelProps) {
  const { svg, base64, contentType, loading, showPreview, format, code = '', engine = 'mermaid' } = props;

  const sanitizedSvg = useMemo(() => {
    if (!svg) return '';
    return DOMPurify.sanitize(svg, {
      USE_PROFILES: { svg: true, svgFilters: true },
    });
  }, [svg]);

  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  // 当预览内容消失时重置视图
  useEffect(() => {
    if (!showPreview) {
      setZoom(1);
      setPan({ x: 0, y: 0 });
    }
  }, [showPreview]);

  // 滚轮缩放
  const handleWheel = (e: WheelEvent) => {
    // 如果按住 Ctrl/Meta 键，或者只是普通的滚轮行为（为了方便，我们允许直接滚轮缩放）
    // 这里为了避免与页面滚动冲突，我们还是建议配合 Ctrl，或者在全屏模式下直接缩放
    // 但为了体验，如果是在这个区域内，我们可以拦截
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      e.stopPropagation();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setZoom((z) => {
        const newZoom = z * delta;
        return Math.min(Math.max(newZoom, 0.1), 10);
      });
    }
  };

  // 开始平移
  const handleMouseDown = (e: MouseEvent) => {
    // 中键 或者 按住空格+左键 (这里简化为直接左键拖拽，如果不是在选中文本的话)
    // 为了避免冲突，我们设定：
    // 1. 中键拖拽
    // 2. 左键拖拽（如果是在空白处）
    // 这里简单起见，允许左键直接拖拽，因为 SVG 通常不需要选中文本
    if (e.button === 0 || e.button === 1) {
      e.preventDefault();
      setIsPanning(true);
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    }
  };

  // 移动中
  const handleMouseMove = (e: MouseEvent) => {
    if (!isPanning) return;
    e.preventDefault();
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
    setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
  };

  // 结束平移
  const endPan = () => {
    setIsPanning(false);
  };

  const handleZoomIn = () => setZoom((z) => Math.min(z * 1.25, 10));
  const handleZoomOut = () => setZoom((z) => Math.max(z / 1.25, 0.1));
  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // 全屏功能
  const handleFullscreen = async () => {
    if (!containerRef.current) return;
    
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (e) {
      console.error('Fullscreen error:', e);
    }
  };

  // 监听全屏变化
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // 只有 SVG 格式支持前端导出和无限缩放
  const exportableSvg = format === 'svg' ? sanitizedSvg : null;
  const previewHint =
    format === 'svg' ? '支持无限缩放与矢量导出' : format === 'png' ? '适合截图分享与复制' : '适合文档交付与打印';

  return (
    <div 
      ref={containerRef}
      className={`relative flex h-full min-h-[420px] w-full flex-col overflow-hidden rounded-[24px] border border-white/70 bg-white/90 shadow-sm backdrop-blur ${isFullscreen ? 'rounded-none border-0' : ''}`}
    >
      {/* 背景网格 */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #64748b 1px, transparent 1px),
            linear-gradient(to bottom, #64748b 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
        }}
      />

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/90 backdrop-blur-sm transition-opacity">
          <div className="flex flex-col items-center gap-4 rounded-2xl bg-white px-10 py-8 shadow-2xl ring-1 ring-slate-900/5">
            <Loader2 className="h-12 w-12 animate-spin text-sky-500" />
            <span className="text-sm font-medium text-slate-600">正在渲染图表...</span>
          </div>
        </div>
      )}

      {/* Preview Meta */}
      <div className="pointer-events-none absolute left-4 top-4 z-20 flex max-w-[calc(100%-210px)] flex-wrap items-center gap-2">
        <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-medium text-slate-600 shadow-sm ring-1 ring-slate-200">
          {ENGINE_LABELS[engine]}
        </span>
        <span className="rounded-full bg-sky-50/95 px-2.5 py-1 text-[11px] font-medium text-sky-700 shadow-sm ring-1 ring-sky-100">
          {FORMAT_LABELS[format]}
        </span>
        <span className="hidden rounded-full bg-slate-900/75 px-2.5 py-1 text-[11px] font-medium text-white shadow-sm md:inline-flex">
          {previewHint}
        </span>
      </div>

      {/* Toolbar */}
      {showPreview && (
        <PreviewToolbar
          scale={zoom}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onResetZoom={handleResetZoom}
          onFullscreen={handleFullscreen}
          svgContent={exportableSvg}
          code={code}
          engine={engine}
        />
      )}

      {/* 全屏退出按钮 */}
      {isFullscreen && (
        <button
          onClick={handleFullscreen}
          className="absolute left-4 top-16 z-30 flex items-center gap-2 rounded-lg bg-slate-800/80 px-3 py-2 text-xs font-medium text-white backdrop-blur hover:bg-slate-700 transition"
        >
          <X className="h-4 w-4" />
          退出全屏 (ESC)
        </button>
      )}

      {/* Empty State */}
      {!showPreview && !loading && (
        <div className="flex h-full flex-col items-center justify-center gap-4 text-slate-400">
          <div className="rounded-2xl bg-slate-50 p-5">
            <ImageIcon className="h-12 w-12 text-slate-300" strokeWidth={1.5} />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-slate-500">预览区域</p>
            <p className="mt-0.5 text-xs text-slate-400">编辑代码后自动渲染</p>
          </div>
        </div>
      )}

      {/* Content Area */}
      <div
        className={`relative flex-1 overflow-hidden ${isPanning ? 'cursor-grabbing' : 'cursor-grab'} ${!showPreview ? 'pointer-events-none' : ''}`}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={endPan}
        onMouseLeave={endPan}
      >
        <div
          className="flex h-full w-full items-center justify-center p-6 pt-20 transition-transform duration-75 ease-out sm:p-8 sm:pt-20"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center',
          }}
        >
          {format === 'svg' && svg && (
            <div
              dangerouslySetInnerHTML={{ __html: sanitizedSvg }}
              className="diagram-container pointer-events-none" // 禁止内部 SVG 的交互，由外层容器接管
            />
          )}
          
          {format === 'png' && base64 && (
            <img
              src={`data:${contentType};base64,${base64}`}
              alt="diagram preview"
              className="max-h-full max-w-full rounded-2xl bg-white shadow-lg ring-1 ring-slate-900/5"
              draggable={false}
            />
          )}
          
          {format === 'pdf' && base64 && (
            <iframe
              title="diagram preview"
              src={`data:application/pdf;base64,${base64}`}
              className="h-full w-full rounded-2xl border border-slate-200 bg-white shadow-sm"
            />
          )}
        </div>
      </div>
    </div>
  );
}
