/**
 * 导出模块统一入口
 *
 * @module lib/export
 */

// 导出类型（from types.ts）
export type { ExportFormat, ExportOptions, ProcessedSvg, ExportError } from './types';
export { DEFAULT_EXPORT_OPTIONS, ExportException } from './types';

// 导出 SVG 预处理器
export { SvgPreprocessor, svgPreprocessor } from './SvgPreprocessor';

// 导出统一服务（主要入口）
export {
  ExportService,
  exportService,
  type ExportDiagramOptions,
  type ExportContentType,
  type CopyOptions,
} from './ExportService';

// 重导出 Engine 相关类型（方便使用）
export type { Engine } from '@/lib/diagramConfig';
