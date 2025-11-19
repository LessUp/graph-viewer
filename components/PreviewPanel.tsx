"use client";

import React, { useEffect, useRef, useState } from 'react';
import type { Engine, Format } from '@/lib/diagramConfig';
import { ENGINE_LABELS, FORMAT_LABELS } from '@/lib/diagramConfig';

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.2;

export type PreviewPanelProps = {
  engine: Engine;
  format: Format;
  svg: string;
  base64: string;
  contentType: string;
  loading: boolean;
};

export function PreviewPanel(props: PreviewPanelProps) {
  const { engine, format, svg, base64, contentType, loading } = props;

  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const panStateRef = useRef<{
    x: number;
    y: number;
    scrollLeft: number;
    scrollTop: number;
  } | null>(null);

  const showPreview = (() => {
    if (format === 'svg') return Boolean(svg);
    return Boolean(base64);
  })();

  useEffect(() => {
    setZoom(1);
  }, [format, svg]);

  function handleWheel(event: React.WheelEvent<HTMLDivElement>) {
    if (!event.ctrlKey) return;
    event.preventDefault();
    const delta = event.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP;
    setZoom((prev) => {
      const next = prev + delta;
      if (next < MIN_ZOOM) return MIN_ZOOM;
      if (next > MAX_ZOOM) return MAX_ZOOM;
      return next;
    });
  }

  function handleMouseDown(event: React.MouseEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    if (!scrollContainerRef.current) return;
    setIsPanning(true);
    panStateRef.current = {
      x: event.clientX,
      y: event.clientY,
      scrollLeft: scrollContainerRef.current.scrollLeft,
      scrollTop: scrollContainerRef.current.scrollTop,
    };
    event.preventDefault();
  }

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    if (!isPanning || !scrollContainerRef.current || !panStateRef.current) return;
    event.preventDefault();
    const dx = event.clientX - panStateRef.current.x;
    const dy = event.clientY - panStateRef.current.y;
    scrollContainerRef.current.scrollLeft = panStateRef.current.scrollLeft - dx;
    scrollContainerRef.current.scrollTop = panStateRef.current.scrollTop - dy;
  }

  function endPan() {
    setIsPanning(false);
    panStateRef.current = null;
  }

  return (
    <div className="space-y-6 rounded-2xl border border-white/60 bg-white/90 p-6 shadow-xl backdrop-blur md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">实时预览</h2>
          <p className="text-sm text-slate-500">根据所选格式展示输出效果。</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
            当前引擎：{ENGINE_LABELS[engine]}
          </span>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
            当前格式：{FORMAT_LABELS[format]}
          </span>
        </div>
      </div>
      <div className="relative flex min-h-[22rem] items-center justify-center overflow-hidden rounded-2xl border border-dashed border-slate-200 bg-white">
        {format === 'svg' && svg && (
          <div className="pointer-events-auto absolute right-4 top-4 z-20 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-xs text-slate-600 shadow">
            <button
              type="button"
              className="rounded-full px-2 py-0.5 hover:bg-slate-100"
              onClick={() =>
                setZoom((prev) => (prev - ZOOM_STEP < MIN_ZOOM ? MIN_ZOOM : prev - ZOOM_STEP))
              }
            >
              -
            </button>
            <button
              type="button"
              className="rounded-full px-2 py-0.5 hover:bg-slate-100"
              onClick={() => setZoom(1)}
            >
              100%
            </button>
            <button
              type="button"
              className="rounded-full px-2 py-0.5 hover:bg-slate-100"
              onClick={() =>
                setZoom((prev) => (prev + ZOOM_STEP > MAX_ZOOM ? MAX_ZOOM : prev + ZOOM_STEP))
              }
            >
              +
            </button>
            <span className="px-1 tabular-nums">{Math.round(zoom * 100)}%</span>
          </div>
        )}
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-sm">
            <svg className="h-9 w-9 animate-spin text-sky-500" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
          </div>
        )}
        {!showPreview && !loading && (
          <div className="flex flex-col items-center gap-2 text-sm text-slate-400">
            <svg className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
              <path d="M10 12h4" />
              <path d="M10 15h6" />
            </svg>
            暂无预览，请输入代码后点击渲染。
          </div>
        )}
        {format === 'svg' && svg && (
          <div
            ref={scrollContainerRef}
            className={`relative h-full w-full overflow-auto bg-white p-4 ${
              isPanning ? 'cursor-grabbing' : 'cursor-grab'
            }`}
            aria-label="SVG 预览"
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={endPan}
            onMouseLeave={endPan}
          >
            <div
              className="inline-block"
              style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          </div>
        )}
        {format === 'png' && base64 && (
          <div className="relative h-full w-full overflow-auto p-4" aria-label="PNG 预览">
            <img
              src={`data:${contentType};base64,${base64}`}
              alt="diagram preview"
              className="mx-auto max-h-[30rem] w-auto max-w-full rounded-xl shadow"
            />
          </div>
        )}
        {format === 'pdf' && base64 && (
          <iframe
            title="diagram preview"
            src={`data:application/pdf;base64,${base64}`}
            className="h-[28rem] w-full rounded-xl border border-slate-200"
          />
        )}
      </div>
      <p className="text-xs text-slate-500">SVG 支持无限缩放，PNG 适合嵌入文档，PDF 便于打印与分享。</p>
    </div>
  );
}

export default PreviewPanel;
