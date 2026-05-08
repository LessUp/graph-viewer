/**
 * PNG 导出器
 */

import { downloadFile } from '../fileDownloader';
import { svgToCanvas } from '../canvasRenderer';
import { logger } from '@/lib/logger';

/**
 * 导出为 PNG 文件（高质量）
 *
 * @param svgContent SVG 内容
 * @param filename 文件名（不含扩展名）
 * @param scale 缩放比例
 */
export async function exportPng(svgContent: string, filename: string, scale = 2): Promise<void> {
  try {
    const canvas = await svgToCanvas(svgContent, {
      scale,
      backgroundColor: '#ffffff',
    });
    const pngUrl = canvas.toDataURL('image/png', 1.0);
    downloadFile(pngUrl, `${filename}.png`);
  } catch (error: unknown) {
    logger.error('png-export', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new Error('PNG 导出失败，请重试');
  }
}

/**
 * 复制 PNG 到剪贴板
 *
 * @param svgContent SVG 内容
 * @param scale 缩放比例
 */
export async function copyPngToClipboard(svgContent: string, scale = 2): Promise<void> {
  const canvas = await svgToCanvas(svgContent, {
    scale,
    backgroundColor: '#ffffff',
  });

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          reject(new Error('转换失败'));
          return;
        }
        try {
          const item = new ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([item]);
          resolve();
        } catch (err: unknown) {
          reject(err);
        }
      },
      'image/png',
      1.0,
    );
  });
}
