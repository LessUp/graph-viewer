/**
 * Markdown 和源码导出器
 */

import { downloadBlob } from '../fileDownloader';
import { generateMarkdownContent } from '../svgProcessor';
import type { Engine } from '@/lib/diagramConfig';
import { ENGINE_LANG_MAP, ENGINE_EXT_MAP } from '@/lib/diagramConfig';

/**
 * 导出为 Markdown 文件
 *
 * @param code 源代码
 * @param engine 图表引擎
 * @param filename 文件名（不含扩展名）
 */
export function exportMarkdown(code: string, engine: Engine, filename: string): void {
  const lang = ENGINE_LANG_MAP[engine];
  const mdContent = generateMarkdownContent(code, lang, filename);
  downloadBlob(new Blob([mdContent], { type: 'text/markdown;charset=utf-8' }), `${filename}.md`);
}

/**
 * 导出源代码文件
 *
 * @param code 源代码
 * @param engine 图表引擎
 * @param filename 文件名（不含扩展名）
 */
export function exportSourceCode(code: string, engine: Engine, filename: string): void {
  const ext = ENGINE_EXT_MAP[engine];
  downloadBlob(new Blob([code], { type: 'text/plain;charset=utf-8' }), `${filename}.${ext}`);
}
