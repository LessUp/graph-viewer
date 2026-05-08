/**
 * ExportService - 统一的图表导出服务
 *
 * Deep Module：提供单一接口处理所有导出格式，内部组合多个适配器
 */

import type { Engine } from '@/lib/diagramConfig';
import type { ExportFormat, ExportOptions } from './types';
import { ExportException } from './types';
import { svgPreprocessor } from './SvgPreprocessor';
import { svgToCanvas } from './canvasRenderer';
import { downloadBlob, downloadFile } from './fileDownloader';
import { generateHtmlWrapper, generateMarkdownContent } from './svgProcessor';
import { ENGINE_LANG_MAP, ENGINE_EXT_MAP } from '@/lib/diagramConfig';
import { logger } from '@/lib/logger';

export type ExportContentType = 'diagram' | 'source';

export interface ExportDiagramOptions {
  content: string;
  filename: string;
  format: ExportFormat;
  type: ExportContentType;
  engine?: Engine;
  options?: ExportOptions;
}

export interface CopyOptions {
  content: string;
  format: 'png' | 'svg';
  options?: ExportOptions;
}

export class ExportService {
  async exportDiagram(params: ExportDiagramOptions): Promise<void> {
    const { content, filename, format, type, engine, options = {} } = params;

    if (type === 'source') {
      return this.exportSource(content, engine!, filename, format);
    }

    return this.exportDiagramContent(content, filename, format, options);
  }

  async copyToClipboard(params: CopyOptions): Promise<void> {
    const { content, format, options = {} } = params;

    if (format === 'svg') {
      return this.copySvgToClipboard(content);
    }

    return this.copyPngToClipboard(content, options);
  }

  getSupportedFormats(): ExportFormat[] {
    return ['svg', 'png', 'jpeg', 'webp', 'pdf', 'html', 'md'];
  }

  private async exportDiagramContent(
    svgContent: string,
    filename: string,
    format: ExportFormat,
    options: ExportOptions,
  ): Promise<void> {
    try {
      switch (format) {
        case 'svg':
          await this.exportSvg(svgContent, filename, options);
          break;
        case 'png':
        case 'jpeg':
        case 'webp':
          await this.exportRasterImage(svgContent, filename, format, options);
          break;
        case 'html':
          await this.exportHtml(svgContent, filename);
          break;
        case 'md':
          throw new ExportException({
            code: 'UNKNOWN',
            message: 'Markdown 导出需要源代码，请使用 type: "source"',
          });
        default:
          throw new ExportException({
            code: 'UNKNOWN',
            message: `不支持的导出格式: ${format}`,
          });
      }
    } catch (error: unknown) {
      if (error instanceof ExportException) {
        throw error;
      }
      throw new ExportException({
        code: 'DOWNLOAD_FAILED',
        message: error instanceof Error ? error.message : '导出失败',
        cause: error,
      });
    }
  }

  private async exportSource(
    code: string,
    engine: Engine,
    filename: string,
    format: ExportFormat,
  ): Promise<void> {
    try {
      if (format === 'md') {
        const lang = ENGINE_LANG_MAP[engine];
        const mdContent = generateMarkdownContent(code, lang, filename);
        downloadBlob(new Blob([mdContent], { type: 'text/markdown;charset=utf-8' }), `${filename}.md`);
        return;
      }

      const ext = ENGINE_EXT_MAP[engine];
      downloadBlob(new Blob([code], { type: 'text/plain;charset=utf-8' }), `${filename}.${ext}`);
    } catch (error: unknown) {
      throw new ExportException({
        code: 'DOWNLOAD_FAILED',
        message: error instanceof Error ? error.message : '导出失败',
        cause: error,
      });
    }
  }

  private async exportSvg(
    svgContent: string,
    filename: string,
    options: ExportOptions,
  ): Promise<void> {
    const { content: processedSvg } = svgPreprocessor.preprocess(svgContent, options);
    downloadBlob(
      new Blob([processedSvg], { type: 'image/svg+xml;charset=utf-8' }),
      `${filename}.svg`,
    );
  }

  private async exportRasterImage(
    svgContent: string,
    filename: string,
    format: 'png' | 'jpeg' | 'webp',
    options: ExportOptions,
  ): Promise<void> {
    try {
      const canvas = await svgToCanvas(svgContent, {
        ...options,
        backgroundColor: options.backgroundColor ?? '#ffffff',
      });
      const mimeType = `image/${format}`;
      const quality = format === 'png' ? 1.0 : (options.quality ?? 0.95);
      const dataUrl = canvas.toDataURL(mimeType, quality);
      downloadFile(dataUrl, `${filename}.${format}`);
    } catch (error: unknown) {
      logger.error('raster-export', {
        format,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw new ExportException({
        code: 'CANVAS_ERROR',
        message: `${format.toUpperCase()} 导出失败，请重试`,
        cause: error,
      });
    }
  }

  private async exportHtml(svgContent: string, filename: string): Promise<void> {
    const { content: processedSvg } = svgPreprocessor.preprocess(svgContent);
    const htmlContent = generateHtmlWrapper(processedSvg, filename);
    downloadBlob(
      new Blob([htmlContent], { type: 'text/html;charset=utf-8' }),
      `${filename}.html`,
    );
  }

  private async copyPngToClipboard(
    svgContent: string,
    options: ExportOptions,
  ): Promise<void> {
    const canvas = await svgToCanvas(svgContent, {
      ...options,
      backgroundColor: options.backgroundColor ?? '#ffffff',
    });

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        async (blob) => {
          if (!blob) {
            reject(
              new ExportException({
                code: 'CANVAS_ERROR',
                message: '转换失败',
              }),
            );
            return;
          }
          try {
            const item = new ClipboardItem({ 'image/png': blob });
            await navigator.clipboard.write([item]);
            resolve();
          } catch (error: unknown) {
            reject(
              new ExportException({
                code: 'UNKNOWN',
                message: error instanceof Error ? error.message : '复制失败',
                cause: error,
              }),
            );
          }
        },
        'image/png',
        1.0,
      );
    });
  }

  private async copySvgToClipboard(svgContent: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(svgContent);
    } catch (error: unknown) {
      throw new ExportException({
        code: 'UNKNOWN',
        message: error instanceof Error ? error.message : '复制失败',
        cause: error,
      });
    }
  }
}

export const exportService = new ExportService();
