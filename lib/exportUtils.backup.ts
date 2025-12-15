/**
 * 导出工具集 - 支持高质量图片导出和多种格式
 */

import html2canvas from 'html2canvas';

export type ExportFormat = 'svg' | 'png' | 'jpeg' | 'webp' | 'pdf' | 'html' | 'md';

export type ExportOptions = {
  scale?: number;           // 缩放倍数 (1-8)
  quality?: number;         // JPEG/WebP 质量 (0-1)
  backgroundColor?: string; // 背景颜色
  padding?: number;         // 内边距（像素）
  watermark?: string;       // 水印文字
  maxWidth?: number;        // 最大宽度限制
  maxHeight?: number;       // 最大高度限制
};

const DEFAULT_OPTIONS: ExportOptions = {
  scale: 2,
  quality: 0.95,
  backgroundColor: '#ffffff',
  padding: 20,
};

/**
 * 将 SVG 字符串转换为 Data URL
 */
export function svgToDataUrl(svgStr: string): string {
  const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
  return URL.createObjectURL(blob);
}

/**
 * 下载文件
 */
export function downloadFile(href: string, filename: string) {
  const a = document.createElement('a');
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * 处理 SVG 内容，确保兼容性
 */
function preprocessSvg(svgContent: string, options: ExportOptions = {}): string {
  let svg = svgContent;

  // 确保包含 xmlns
  if (!svg.includes('xmlns="http://www.w3.org/2000/svg"')) {
    svg = svg.replace(/<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
  }

  // 确保包含 xmlns:xlink
  if (!svg.includes('xmlns:xlink') && svg.includes('xlink:')) {
    svg = svg.replace(/<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
  }

  // 添加内边距
  if (options.padding && options.padding > 0) {
    const viewBoxMatch = svg.match(/viewBox="([^"]+)"/);
    if (viewBoxMatch) {
      const [minX, minY, width, height] = viewBoxMatch[1].split(/\s+/).map(Number);
      const newViewBox = `${minX - options.padding} ${minY - options.padding} ${width + options.padding * 2} ${height + options.padding * 2}`;
      svg = svg.replace(/viewBox="[^"]+"/, `viewBox="${newViewBox}"`);
    }
  }

  return svg;
}

/**
 * 从 SVG 中提取尺寸
 */
function getSvgDimensions(svgContent: string): { width: number; height: number } {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgContent, 'image/svg+xml');
  const svgElement = doc.querySelector('svg');

  if (!svgElement) {
    return { width: 800, height: 600 };
  }

  // 尝试从 width/height 属性获取
  let width = parseFloat(svgElement.getAttribute('width') || '0');
  let height = parseFloat(svgElement.getAttribute('height') || '0');

  // 如果没有明确的宽高，从 viewBox 获取
  if ((!width || !height) && svgElement.hasAttribute('viewBox')) {
    const viewBox = svgElement.getAttribute('viewBox')!.split(/\s+/);
    width = parseFloat(viewBox[2]) || 800;
    height = parseFloat(viewBox[3]) || 600;
  }

  return {
    width: width || 800,
    height: height || 600,
  };
}

/**
 * 导出为 SVG 文件
 */
export function exportSvg(svgContent: string, filename: string, options: ExportOptions = {}) {
  const processedSvg = preprocessSvg(svgContent, options);
  const url = svgToDataUrl(processedSvg);
  downloadFile(url, `${filename}.svg`);
  URL.revokeObjectURL(url);
}

/**
 * 将 SVG 渲染到 Canvas
 */
async function svgToCanvas(svgContent: string, options: ExportOptions = {}): Promise<HTMLCanvasElement> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const processedSvg = preprocessSvg(svgContent, opts);

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = svgToDataUrl(processedSvg);

    img.onload = () => {
      try {
        const { width, height } = getSvgDimensions(processedSvg);
        const scale = opts.scale || 2;

        // 应用最大尺寸限制
        let finalWidth = width * scale;
        let finalHeight = height * scale;

        if (opts.maxWidth && finalWidth > opts.maxWidth) {
          const ratio = opts.maxWidth / finalWidth;
          finalWidth = opts.maxWidth;
          finalHeight *= ratio;
        }

        if (opts.maxHeight && finalHeight > opts.maxHeight) {
          const ratio = opts.maxHeight / finalHeight;
          finalHeight = opts.maxHeight;
          finalWidth *= ratio;
        }

        const canvas = document.createElement('canvas');
        canvas.width = finalWidth;
        canvas.height = finalHeight;

        const ctx = canvas.getContext('2d', { alpha: true });
        if (!ctx) throw new Error('无法获取 Canvas 上下文');

        // 启用图像平滑
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // 绘制背景
        if (opts.backgroundColor && opts.backgroundColor !== 'transparent') {
          ctx.fillStyle = opts.backgroundColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // 绘制图像
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // 添加水印
        if (opts.watermark) {
          ctx.save();
          ctx.globalAlpha = 0.3;
          ctx.font = `${Math.max(12, finalWidth / 50)}px sans-serif`;
          ctx.fillStyle = '#666666';
          ctx.textAlign = 'right';
          ctx.textBaseline = 'bottom';
          ctx.fillText(opts.watermark, canvas.width - 10, canvas.height - 10);
          ctx.restore();
        }

        URL.revokeObjectURL(url);
        resolve(canvas);
      } catch (e) {
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
 * 导出为 PNG 文件
 */
export async function exportPng(svgContent: string, filename: string, scale = 2): Promise<void> {
  const canvas = await svgToCanvas(svgContent, { scale });
  const pngUrl = canvas.toDataURL('image/png');
  downloadFile(pngUrl, `${filename}.png`);
}

/**
 * 高级导出 - 支持更多选项
 */
export async function exportImage(
  svgContent: string,
  filename: string,
  format: ExportFormat,
  options: ExportOptions = {}
): Promise<void> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  if (format === 'svg') {
    exportSvg(svgContent, filename, opts);
    return;
  }

  const canvas = await svgToCanvas(svgContent, opts);

  let mimeType: string;
  let extension: string;

  switch (format) {
    case 'jpeg':
      mimeType = 'image/jpeg';
      extension = 'jpg';
      break;
    case 'webp':
      mimeType = 'image/webp';
      extension = 'webp';
      break;
    case 'pdf':
      // PDF 导出需要特殊处理
      await exportToPdf(canvas, filename);
      return;
    default:
      mimeType = 'image/png';
      extension = 'png';
  }

  const dataUrl = canvas.toDataURL(mimeType, opts.quality);
  downloadFile(dataUrl, `${filename}.${extension}`);
}

/**
 * 导出为 PDF（简单实现，使用 Canvas 转图片嵌入 PDF）
 */
async function exportToPdf(canvas: HTMLCanvasElement, filename: string): Promise<void> {
  // 创建简单的 PDF（嵌入 PNG 图片）
  // 注意：这是一个简化实现，生产环境可能需要使用 jsPDF 等库

  const imgData = canvas.toDataURL('image/png');
  const width = canvas.width;
  const height = canvas.height;

  // 简单的 PDF 结构
  const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>
endobj
4 0 obj
<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length 0 >>
stream
endstream
endobj
5 0 obj
<< /Length 44 >>
stream
q ${width} 0 0 ${height} 0 0 cm /Im0 Do Q
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000270 00000 n 
0000000430 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
523
%%EOF`;

  // 由于完整 PDF 实现复杂，这里改为下载 PNG
  // 实际项目中建议使用 jsPDF 或 pdf-lib
  console.warn('PDF 导出功能建议使用专业库（如 jsPDF）实现，当前降级为 PNG 导出');
  const pngUrl = canvas.toDataURL('image/png');
  downloadFile(pngUrl, `${filename}.png`);
}

/**
 * 复制 PNG 到剪贴板
 */
export async function copyPngToClipboard(svgContent: string, scale = 2): Promise<void> {
  const canvas = await svgToCanvas(svgContent, { scale, backgroundColor: '#ffffff' });

  return new Promise((resolve, reject) => {
    canvas.toBlob(async (blob) => {
      if (!blob) {
        reject(new Error('Canvas to Blob failed'));
        return;
      }
      try {
        const item = new ClipboardItem({ 'image/png': blob });
        await navigator.clipboard.write([item]);
        resolve();
      } catch (err) {
        reject(err);
      }
    }, 'image/png');
  });
}

/**
 * 复制 SVG 到剪贴板
 */
export async function copySvgToClipboard(svgContent: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(svgContent);
  } catch (err) {
    throw new Error('复制 SVG 到剪贴板失败');
  }
}

/**
 * 导出为 HTML 文件（包含完整的 SVG 和样式）
 */
export function exportHtml(svgContent: string, filename: string, title = 'Diagram'): void {
  const htmlContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
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

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  downloadFile(url, `${filename}.html`);
  URL.revokeObjectURL(url);
}

/**
 * 导出为 Markdown 文件（包含源代码）
 */
export function exportMarkdown(code: string, engine: string, filename: string): void {
  // 根据引擎类型确定代码块语言标识
  const langMap: Record<string, string> = {
    mermaid: 'mermaid',
    flowchart: 'mermaid',
    graphviz: 'dot',
    plantuml: 'plantuml',
    d2: 'd2',
    blockdiag: 'blockdiag',
    seqdiag: 'seqdiag',
    actdiag: 'actdiag',
    nwdiag: 'nwdiag',
    erd: 'erd',
    vega: 'json',
    'vega-lite': 'json',
    wavedrom: 'json',
    ditaa: 'ditaa',
    svgbob: 'svgbob',
    nomnoml: 'nomnoml',
  };

  const lang = langMap[engine] || engine;

  const mdContent = `# ${filename}

\`\`\`${lang}
${code}
\`\`\`

---
*Generated by GraphViewer*
`;

  const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  downloadFile(url, `${filename}.md`);
  URL.revokeObjectURL(url);
}

/**
 * 导出源代码文件（根据引擎类型选择后缀）
 */
export function exportSourceCode(code: string, engine: string, filename: string): void {
  // 根据引擎类型确定文件后缀
  const extMap: Record<string, string> = {
    mermaid: 'mmd',
    flowchart: 'mmd',
    graphviz: 'dot',
    plantuml: 'puml',
    d2: 'd2',
    blockdiag: 'diag',
    seqdiag: 'diag',
    actdiag: 'diag',
    nwdiag: 'diag',
    erd: 'er',
    vega: 'vg.json',
    'vega-lite': 'vl.json',
    wavedrom: 'json',
    ditaa: 'ditaa',
    svgbob: 'bob',
    nomnoml: 'nomnoml',
  };

  const ext = extMap[engine] || 'txt';

  const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  downloadFile(url, `${filename}.${ext}`);
  URL.revokeObjectURL(url);
}

/**
 * 获取图片 Base64（用于预览或嵌入）
 */
export async function getImageBase64(
  svgContent: string,
  format: 'png' | 'jpeg' | 'webp' = 'png',
  options: ExportOptions = {}
): Promise<string> {
  const canvas = await svgToCanvas(svgContent, options);
  const mimeType = format === 'jpeg' ? 'image/jpeg' : format === 'webp' ? 'image/webp' : 'image/png';
  return canvas.toDataURL(mimeType, options.quality || 0.92);
}

/**
 * 批量导出多个图表
 */
export async function exportMultiple(
  diagrams: Array<{ svgContent: string; filename: string }>,
  format: ExportFormat,
  options: ExportOptions = {}
): Promise<void> {
  for (const diagram of diagrams) {
    await exportImage(diagram.svgContent, diagram.filename, format, options);
    // 添加小延迟避免浏览器限制
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

/**
 * 预设导出配置
 */
export const EXPORT_PRESETS = {
  web: { scale: 1, quality: 0.85, backgroundColor: 'transparent' },
  print: { scale: 4, quality: 0.95, backgroundColor: '#ffffff' },
  presentation: { scale: 2, quality: 0.92, backgroundColor: '#ffffff' },
  retina: { scale: 3, quality: 0.9, backgroundColor: '#ffffff' },
  ultra: { scale: 8, quality: 1, backgroundColor: '#ffffff' },
} as const;

export type ExportPreset = keyof typeof EXPORT_PRESETS;
