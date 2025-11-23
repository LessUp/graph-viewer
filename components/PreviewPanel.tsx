
'use client';

import { useEffect, useRef, useState, type MouseEvent, type WheelEvent } from 'react';
import { PreviewToolbar } from '@/components/PreviewToolbar';

export type PreviewPanelProps = {
  svg: string;
  base64: string;
  contentType: string;
  loading: boolean;
  showPreview: boolean;
  format: string;
};

export function PreviewPanel(props: PreviewPanelProps) {
  const { svg, base64, contentType, loading, showPreview, format } = props;

  const scrollContainerRef = useRef<HTMLDivElement>(null);
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

  // 只有 SVG 格式支持前端导出和无限缩放
  const exportableSvg = format === 'svg' ? svg : null;

  return (
    <div className="relative flex h-full min-h-[500px] w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/50 shadow-inner">
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/80 backdrop-blur-sm transition-opacity">
          <div className="flex flex-col items-center gap-3 rounded-xl bg-white px-8 py-6 shadow-xl ring-1 ring-slate-900/5">
            <svg className="h-8 w-8 animate-spin text-sky-500" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            <span className="text-sm font-medium text-slate-600">渲染中...</span>
          </div>
        </div>
      )}

      {/* Toolbar */}
      {showPreview && (
        <PreviewToolbar
          scale={zoom}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onResetZoom={handleResetZoom}
          svgContent={exportableSvg}
        />
      )}

      {/* Empty State */}
      {!showPreview && !loading && (
        <div className="flex h-full flex-col items-center justify-center gap-4 text-slate-400">
          <div className="rounded-full bg-slate-100 p-6 shadow-sm">
            <svg className="h-12 w-12 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-sm font-medium">暂无预览，请输入代码后点击渲染</p>
        </div>
      )}

      {/* Content Area */}
      <div
        ref={scrollContainerRef}
        className={`relative h-full w-full overflow-hidden ${isPanning ? 'cursor-grabbing' : 'cursor-grab'} ${!showPreview ? 'pointer-events-none' : ''}`}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={endPan}
        onMouseLeave={endPan}
      >
        <div
          className="flex h-full w-full items-center justify-center p-8 transition-transform duration-75 ease-out"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center',
          }}
        >
          {format === 'svg' && svg && (
            <div
              dangerouslySetInnerHTML={{ __html: svg }}
              className="diagram-container pointer-events-none" // 禁止内部 SVG 的交互，由外层容器接管
            />
          )}
          
          {format === 'png' && base64 && (
            <img
              src={`data:${contentType};base64,${base64}`}
              alt="diagram preview"
              className="max-h-full max-w-full shadow-lg ring-1 ring-slate-900/5"
              draggable={false}
            />
          )}
          
          {format === 'pdf' && base64 && (
            <iframe
              title="diagram preview"
              src={`data:application/pdf;base64,${base64}`}
              className="h-full w-full rounded border border-slate-200 shadow-sm"
            />
          )}
        </div>
      </div>
    </div>
  );
}
