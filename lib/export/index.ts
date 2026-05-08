/**
 * 导出工具统一入口
 *
 * 向后兼容层：保持原有 API 不变，内部使用模块化的导出器
 *
 * @module lib/export
 */

// 导出类型
export type { ExportFormat, ExportOptions, ProcessedSvg, ExportError } from './types';
export { DEFAULT_EXPORT_OPTIONS, ExportException } from './types';

// 导出纯函数（可独立测试）
export {
  ensureNamespaces,
  wrapStyleWithCdata,
  extractSvgDimensions,
  calculatePaddedViewBox,
  inlineComputedStyles,
  preprocessSvg,
  generateHtmlWrapper,
  generateMarkdownContent,
} from './svgProcessor';

// 导出下载工具
export { downloadFile, downloadBlob } from './fileDownloader';

// 导出 Canvas 渲染工具
export { svgToCanvas, svgToDataUrl } from './canvasRenderer';

// 导出各格式导出器
export { exportSvg } from './exporters/svg';
export { exportPng, copyPngToClipboard } from './exporters/png';
export { exportHtml } from './exporters/html';
export { exportMarkdown, exportSourceCode } from './exporters/markdown';

// 重新导出 Engine 相关类型（方便使用）
export type { Engine } from '@/lib/diagramConfig';
