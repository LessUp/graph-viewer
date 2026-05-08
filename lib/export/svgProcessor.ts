/**
 * SVG 预处理纯函数
 *
 * 所有函数都是纯函数或确定性函数，可独立测试
 */

import type { ExportOptions, ProcessedSvg } from './types';
import { DEFAULT_EXPORT_OPTIONS } from './types';

/**
 * HTML 转义
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * 确保 SVG 命名空间正确
 *
 * @param svgContent SVG 内容
 * @returns 添加了正确命名空间的 SVG 内容
 */
export function ensureNamespaces(svgContent: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgContent, 'image/svg+xml');
  const svgElement = doc.querySelector('svg');

  if (!svgElement) {
    return svgContent;
  }

  if (!svgElement.hasAttribute('xmlns')) {
    svgElement.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  }
  if (!svgElement.hasAttribute('xmlns:xlink') && svgContent.includes('xlink:')) {
    svgElement.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
  }

  return new XMLSerializer().serializeToString(svgElement);
}

/**
 * 包装 style 标签内容为 CDATA
 *
 * @param styleContent style 标签内容
 * @returns 包装后的内容
 */
export function wrapStyleWithCdata(styleContent: string): string {
  if (!styleContent || styleContent.includes('CDATA')) {
    return styleContent;
  }
  return `\n/*<![CDATA[*/\n${styleContent}\n/*]]>*/\n`;
}

/**
 * 处理 SVG 中的 style 标签，添加 CDATA 包装
 *
 * @param svgElement SVG 元素
 */
function processStyleElements(svgElement: SVGSVGElement): void {
  const styleElements = svgElement.querySelectorAll('style');
  styleElements.forEach((style) => {
    if (style.textContent && !style.textContent.includes('CDATA')) {
      style.textContent = wrapStyleWithCdata(style.textContent);
    }
  });
}

/**
 * 提取 SVG 尺寸信息
 *
 * @param svgContent SVG 内容
 * @returns 宽度和高度
 */
export function extractSvgDimensions(svgContent: string): { width: number; height: number } {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgContent, 'image/svg+xml');
  const svgElement = doc.querySelector('svg');

  if (!svgElement) {
    return { width: 800, height: 600 };
  }

  let width = parseFloat(svgElement.getAttribute('width') || '0');
  let height = parseFloat(svgElement.getAttribute('height') || '0');

  if ((!width || !height) && svgElement.hasAttribute('viewBox')) {
    const viewBox = svgElement.getAttribute('viewBox')!.split(/\s+/);
    width = parseFloat(viewBox[2] ?? '800') || 800;
    height = parseFloat(viewBox[3] ?? '600') || 600;
  }

  return {
    width: width || 800,
    height: height || 600,
  };
}

/**
 * 计算添加 padding 后的 viewBox
 *
 * @param viewBox 原始 viewBox 字符串
 * @param padding 内边距
 * @returns 新的 viewBox 字符串，如果计算失败返回 null
 */
export function calculatePaddedViewBox(viewBox: string, padding: number): string | null {
  const parts = viewBox.split(/\s+/).map(Number);
  if (parts.length !== 4) return null;

  const [minX = 0, minY = 0, width = 0, height = 0] = parts;
  return `${minX - padding} ${minY - padding} ${width + padding * 2} ${height + padding * 2}`;
}

/**
 * 内联 SVG 元素的重要样式属性
 *
 * 注意：此函数需要访问 window.getComputedStyle，因此有 DOM 依赖
 * 但仍然是确定性的：相同输入产生相同输出
 *
 * @param svgContent SVG 内容
 * @param properties 要内联的属性列表
 * @returns 处理后的 SVG 内容
 */
export function inlineComputedStyles(
  svgContent: string,
  properties: string[] = [
    'fill',
    'stroke',
    'stroke-width',
    'font-family',
    'font-size',
    'font-weight',
    'opacity',
  ],
): string {
  if (typeof window === 'undefined') {
    return svgContent;
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(svgContent, 'image/svg+xml');
  const svgElement = doc.querySelector('svg');

  if (!svgElement) {
    return svgContent;
  }

  const allElements = svgElement.querySelectorAll('*');
  allElements.forEach((element) => {
    if (element instanceof SVGElement) {
      const computedStyle = window.getComputedStyle(element);
      properties.forEach((prop) => {
        const value = computedStyle.getPropertyValue(prop);
        if (value && value !== 'none' && !element.hasAttribute(prop)) {
          element.setAttribute(prop, value);
        }
      });
    }
  });

  return new XMLSerializer().serializeToString(svgElement);
}

/**
 * 确保 SVG 有明确的宽高属性
 *
 * @param svgElement SVG 元素
 */
function ensureDimensions(svgElement: SVGSVGElement): void {
  if (!svgElement.hasAttribute('width') || !svgElement.hasAttribute('height')) {
    const viewBox = svgElement.getAttribute('viewBox');
    if (viewBox) {
      const parts = viewBox.split(/\s+/);
      if (parts.length === 4) {
        if (!svgElement.hasAttribute('width')) {
          svgElement.setAttribute('width', parts[2] ?? '800');
        }
        if (!svgElement.hasAttribute('height')) {
          svgElement.setAttribute('height', parts[3] ?? '600');
        }
      }
    }
  }
}

/**
 * 预处理 SVG（组合函数）
 *
 * @param svgContent 原始 SVG 内容
 * @param options 导出选项
 * @returns 处理结果
 */
export function preprocessSvg(
  svgContent: string,
  options: Partial<ExportOptions> = {},
): ProcessedSvg {
  const opts = { ...DEFAULT_EXPORT_OPTIONS, ...options };

  const parser = new DOMParser();
  const doc = parser.parseFromString(svgContent, 'image/svg+xml');
  const svgElement = doc.querySelector('svg');

  if (!svgElement) {
    const { width, height } = extractSvgDimensions(svgContent);
    return { content: svgContent, width, height };
  }

  // 确保命名空间
  if (!svgElement.hasAttribute('xmlns')) {
    svgElement.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  }
  if (!svgElement.hasAttribute('xmlns:xlink') && svgContent.includes('xlink:')) {
    svgElement.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
  }

  // 处理 style 标签
  processStyleElements(svgElement);

  // 内联计算样式（需要 DOM 环境）
  if (typeof window !== 'undefined') {
    const allElements = svgElement.querySelectorAll('*');
    const properties = [
      'fill',
      'stroke',
      'stroke-width',
      'font-family',
      'font-size',
      'font-weight',
      'opacity',
    ];
    allElements.forEach((element) => {
      if (element instanceof SVGElement) {
        const computedStyle = window.getComputedStyle(element);
        properties.forEach((prop) => {
          const value = computedStyle.getPropertyValue(prop);
          if (value && value !== 'none' && !element.hasAttribute(prop)) {
            element.setAttribute(prop, value);
          }
        });
      }
    });
  }

  // 确保尺寸
  ensureDimensions(svgElement);

  // 处理 padding
  if (opts.padding > 0) {
    const viewBox = svgElement.getAttribute('viewBox');
    if (viewBox) {
      const newViewBox = calculatePaddedViewBox(viewBox, opts.padding);
      if (newViewBox) {
        svgElement.setAttribute('viewBox', newViewBox);
      }
    }
  }

  const processed = new XMLSerializer().serializeToString(svgElement);
  const { width, height } = extractSvgDimensions(processed);

  return { content: processed, width, height };
}

/**
 * 生成 HTML 包装
 *
 * @param svgContent SVG 内容
 * @param title 标题
 * @returns 完整的 HTML 文档
 */
export function generateHtmlWrapper(svgContent: string, title: string): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      padding: 2rem;
    }
    .container {
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.1);
      padding: 2rem;
      max-width: 100%;
      overflow: auto;
    }
    svg {
      display: block;
      max-width: 100%;
      height: auto;
    }
    .footer {
      margin-top: 1rem;
      text-align: center;
      font-size: 12px;
      color: #999;
    }
  </style>
</head>
<body>
  <div class="container">
    ${svgContent}
    <div class="footer">Generated by GraphViewer</div>
  </div>
</body>
</html>`;
}

/**
 * 生成 Markdown 内容
 *
 * @param code 源代码
 * @param lang 语言标识
 * @param filename 文件名
 * @returns Markdown 内容
 */
export function generateMarkdownContent(code: string, lang: string, filename: string): string {
  return `# ${filename}

\`\`\`${lang}
${code}
\`\`\`

---
*Generated by GraphViewer*
`;
}
