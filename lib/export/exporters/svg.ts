/**
 * SVG 导出器
 */

import { downloadBlob } from '../fileDownloader';
import { svgPreprocessor } from '../SvgPreprocessor';
import type { ExportOptions } from '../types';

/**
 * 导出为 SVG 文件
 *
 * @param svgContent SVG 内容
 * @param filename 文件名（不含扩展名）
 * @param options 导出选项
 */
export function exportSvg(svgContent: string, filename: string, options: ExportOptions = {}): void {
  const { content: processedSvg } = svgPreprocessor.preprocess(svgContent, options);
  downloadBlob(
    new Blob([processedSvg], { type: 'image/svg+xml;charset=utf-8' }),
    `${filename}.svg`,
  );
}
