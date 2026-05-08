/**
 * HTML 导出器
 */

import { downloadBlob } from '../fileDownloader';
import { preprocessSvg, generateHtmlWrapper } from '../svgProcessor';

/**
 * 导出为 HTML 文件
 *
 * @param svgContent SVG 内容
 * @param filename 文件名（不含扩展名）
 * @param title 页面标题
 */
export function exportHtml(svgContent: string, filename: string, title = 'Diagram'): void {
  const { content: processedSvg } = preprocessSvg(svgContent);
  const htmlContent = generateHtmlWrapper(processedSvg, title);
  downloadBlob(new Blob([htmlContent], { type: 'text/html;charset=utf-8' }), `${filename}.html`);
}
