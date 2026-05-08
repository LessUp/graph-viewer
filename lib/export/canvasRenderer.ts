/**
 * Canvas 渲染工具
 *
 * 将 SVG 转换为 Canvas，用于位图导出
 */

import html2canvas from 'html2canvas';
import { logger } from '@/lib/logger';
import type { ExportOptions } from './types';
import { DEFAULT_EXPORT_OPTIONS } from './types';
import { preprocessSvg } from './svgProcessor';

/**
 * 在 Canvas 上绘制水印
 *
 * @param canvas Canvas 元素
 * @param watermark 水印文本
 */
function drawWatermark(canvas: HTMLCanvasElement, watermark?: string): void {
  if (!watermark) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.save();
  ctx.globalAlpha = 0.3;
  ctx.font = `${Math.max(12, canvas.width / 50)}px sans-serif`;
  ctx.fillStyle = '#666666';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  ctx.fillText(watermark, canvas.width - 10, canvas.height - 10);
  ctx.restore();
}

/**
 * 使用 html2canvas 方法（最可靠）
 *
 * @param svgContent SVG 内容
 * @param options 导出选项
 * @returns Canvas 元素
 */
async function svgToCanvasUsingHtml2Canvas(
  svgContent: string,
  options: ExportOptions = {},
): Promise<HTMLCanvasElement> {
  const opts = { ...DEFAULT_EXPORT_OPTIONS, ...options };
  const { content: processedSvg, width, height } = preprocessSvg(svgContent, opts);

  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '-9999px';
  container.style.width = `${width}px`;
  container.style.height = `${height}px`;
  container.style.backgroundColor = opts.backgroundColor || '#ffffff';
  container.innerHTML = processedSvg;
  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: opts.scale || 2,
      backgroundColor: opts.backgroundColor || '#ffffff',
      logging: false,
      useCORS: true,
      allowTaint: true,
      imageTimeout: 0,
      removeContainer: false,
      foreignObjectRendering: false, // 禁用 foreignObject 以提高兼容性
    });

    drawWatermark(canvas, opts.watermark);

    return canvas;
  } finally {
    document.body.removeChild(container);
  }
}

/**
 * 使用原生 Image 方法（备用）
 *
 * @param svgContent SVG 内容
 * @param options 导出选项
 * @returns Canvas 元素
 */
async function svgToCanvasUsingImage(
  svgContent: string,
  options: ExportOptions = {},
): Promise<HTMLCanvasElement> {
  const opts = { ...DEFAULT_EXPORT_OPTIONS, ...options };
  const { content: processedSvg, width, height } = preprocessSvg(svgContent, opts);
  const scale = opts.scale || 2;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = width * scale;
    canvas.height = height * scale;

    const ctx = canvas.getContext('2d', {
      alpha: opts.backgroundColor === 'transparent',
      willReadFrequently: false,
    });

    if (!ctx) {
      reject(new Error('无法获取 Canvas 上下文'));
      return;
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    if (opts.backgroundColor && opts.backgroundColor !== 'transparent') {
      ctx.fillStyle = opts.backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    const img = new Image();
    const svgBlob = new Blob([processedSvg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      try {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        drawWatermark(canvas, opts.watermark);

        URL.revokeObjectURL(url);
        resolve(canvas);
      } catch (e: unknown) {
        URL.revokeObjectURL(url);
        reject(e);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('SVG 图片加载失败'));
    };

    img.src = url;
  });
}

/**
 * 智能选择转换方法
 *
 * 优先使用 html2canvas，失败时降级到原生 Image 方法
 *
 * @param svgContent SVG 内容
 * @param options 导出选项
 * @returns Canvas 元素
 */
export async function svgToCanvas(
  svgContent: string,
  options: ExportOptions = {},
): Promise<HTMLCanvasElement> {
  try {
    return await svgToCanvasUsingHtml2Canvas(svgContent, options);
  } catch (error: unknown) {
    logger.warn('html2canvas-fallback', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return await svgToCanvasUsingImage(svgContent, options);
  }
}

/**
 * 创建 SVG 的 Canvas 并返回 data URL
 *
 * @param svgContent SVG 内容
 * @param format 图片格式
 * @param options 导出选项
 * @returns data URL
 */
export async function svgToDataUrl(
  svgContent: string,
  format: 'png' | 'jpeg' | 'webp' = 'png',
  options: ExportOptions = {},
): Promise<string> {
  const canvas = await svgToCanvas(svgContent, options);
  const mimeType = `image/${format}`;
  const quality = format === 'png' ? 1.0 : (options.quality ?? 0.95);
  return canvas.toDataURL(mimeType, quality);
}
