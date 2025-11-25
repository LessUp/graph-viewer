/**
 * 语法高亮配置 - 为不同的图表引擎提供 CodeMirror 语法高亮支持
 * 使用内置语言模式避免版本冲突
 */

import { javascript } from '@codemirror/lang-javascript';
import { markdown } from '@codemirror/lang-markdown';
import type { Extension } from '@codemirror/state';

// 由于 CodeMirror 版本兼容性问题，暂时使用内置语言模式
// 后续可以通过升级依赖来支持自定义语法高亮

// 获取引擎对应的语言扩展
export function getLanguageExtension(engine: string): Extension[] {
  // JSON 格式的引擎使用 JavaScript 模式
  const jsonEngines = ['vega', 'vegalite', 'wavedrom'];
  if (jsonEngines.includes(engine)) {
    return [javascript()];
  }
  
  // 其他引擎暂时使用 markdown 模式（支持基本高亮）
  // 这样可以避免 CodeMirror 版本冲突问题
  return [markdown()];
}

// 导出类型
export type SupportedLanguage = string;
