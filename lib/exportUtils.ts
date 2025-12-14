/**
 * 增强版导出工具 - 添加更多导出选项和优化
 */

import html2canvas from 'html2canvas';

export type ExportFormat = 'svg' | 'png' | 'jpeg' | 'webp' | 'pdf' | 'html' | 'md';

export type ExportOptions = {
    scale?: number;
    quality?: number;
    backgroundColor?: string;
    padding?: number;
    watermark?: string;
    maxWidth?: number;
    maxHeight?: number;
};

const DEFAULT_OPTIONS: ExportOptions = {
    scale: 2,
    quality: 0.95,
    backgroundColor: '#ffffff',
    padding: 20,
};

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
 * 增强的 SVG 预处理 - 确保所有样式和字体都被正确内联
 */
function preprocessSvg(svgContent: string, options: ExportOptions = {}): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgContent, 'image/svg+xml');
    const svgElement = doc.querySelector('svg');

    if (!svgElement) {
        return svgContent;
    }

    // 确保命名空间
    if (!svgElement.hasAttribute('xmlns')) {
        svgElement.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    }
    if (!svgElement.hasAttribute('xmlns:xlink') && svgContent.includes('xlink:')) {
        svgElement.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
    }

    // 处理样式标签
    const styleElements = svgElement.querySelectorAll('style');
    styleElements.forEach((style) => {
        if (style.textContent && !style.textContent.includes('CDATA')) {
            style.textContent = `\n/*<![CDATA[*/\n${style.textContent}\n/*]]>*/\n`;
        }
    });

    // 内联所有计算样式到元素上（确保导出时样式不丢失）
    const allElements = svgElement.querySelectorAll('*');
    allElements.forEach((element) => {
        if (element instanceof SVGElement) {
            const computedStyle = window.getComputedStyle(element);
            const importantStyles = [
                'fill',
                'stroke',
                'stroke-width',
                'font-family',
                'font-size',
                'font-weight',
                'opacity',
            ];

            importantStyles.forEach((prop) => {
                const value = computedStyle.getPropertyValue(prop);
                if (value && value !== 'none' && !element.hasAttribute(prop)) {
                    element.setAttribute(prop, value);
                }
            });
        }
    });

    // 确保有明确的宽高
    if (!svgElement.hasAttribute('width') || !svgElement.hasAttribute('height')) {
        const viewBox = svgElement.getAttribute('viewBox');
        if (viewBox) {
            const parts = viewBox.split(/\s+/);
            if (parts.length === 4) {
                if (!svgElement.hasAttribute('width')) {
                    svgElement.setAttribute('width', parts[2]);
                }
                if (!svgElement.hasAttribute('height')) {
                    svgElement.setAttribute('height', parts[3]);
                }
            }
        }
    }

    // 添加内边距
    if (options.padding && options.padding > 0) {
        const viewBox = svgElement.getAttribute('viewBox');
        if (viewBox) {
            const [minX, minY, width, height] = viewBox.split(/\s+/).map(Number);
            const padding = options.padding;
            svgElement.setAttribute(
                'viewBox',
                `${minX - padding} ${minY - padding} ${width + padding * 2} ${height + padding * 2}`
            );
        }
    }

    return new XMLSerializer().serializeToString(svgElement);
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

    let width = parseFloat(svgElement.getAttribute('width') || '0');
    let height = parseFloat(svgElement.getAttribute('height') || '0');

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
    const blob = new Blob([processedSvg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    downloadFile(url, `${filename}.svg`);
    URL.revokeObjectURL(url);
}

/**
 * 使用 html2canvas 方法（最可靠）
 */
async function svgToCanvasUsingHtml2Canvas(
    svgContent: string,
    options: ExportOptions = {}
): Promise<HTMLCanvasElement> {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const processedSvg = preprocessSvg(svgContent, opts);
    const { width, height } = getSvgDimensions(processedSvg);

    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    container.style.width = `${width}px`;
    container.style.height = `${height}px`;
    container.style.backgroundColor = opts.backgroundColor || '#ffffff';
    container.innerHTML = processedSvg;
    document.body.appendChild(container);

    try {
        const canvas = await html2canvas(container, {
            scale: opts.scale || 2,
            backgroundColor: opts.backgroundColor || '#ffffff',
            logging: false,
            useCORS: true,
            allowTaint: true,
            imageTimeout: 0,
            removeContainer: false,
            foreignObjectRendering: false, // 禁用 foreignObject 以提高兼容性
        });

        if (opts.watermark) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.save();
                ctx.globalAlpha = 0.3;
                ctx.font = `${Math.max(12, canvas.width / 50)}px sans-serif`;
                ctx.fillStyle = '#666666';
                ctx.textAlign = 'right';
                ctx.textBaseline = 'bottom';
                ctx.fillText(opts.watermark, canvas.width - 10, canvas.height - 10);
                ctx.restore();
            }
        }

        return canvas;
    } finally {
        document.body.removeChild(container);
    }
}

/**
 * 使用原生 Image 方法（备用）
 */
async function svgToCanvasUsingImage(
    svgContent: string,
    options: ExportOptions = {}
): Promise<HTMLCanvasElement> {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const processedSvg = preprocessSvg(svgContent, opts);

    return new Promise((resolve, reject) => {
        const { width, height } = getSvgDimensions(processedSvg);
        const scale = opts.scale || 2;

        const canvas = document.createElement('canvas');
        canvas.width = width * scale;
        canvas.height = height * scale;

        const ctx = canvas.getContext('2d', {
            alpha: opts.backgroundColor === 'transparent',
            willReadFrequently: false,
        });

        if (!ctx) {
            reject(new Error('无法获取 Canvas 上下文'));
            return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        if (opts.backgroundColor && opts.backgroundColor !== 'transparent') {
            ctx.fillStyle = opts.backgroundColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        const img = new Image();
        const svgBlob = new Blob([processedSvg], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        img.onload = () => {
            try {
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                if (opts.watermark) {
                    ctx.save();
                    ctx.globalAlpha = 0.3;
                    ctx.font = `${Math.max(12, canvas.width / 50)}px sans-serif`;
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
 * 智能选择转换方法
 */
async function svgToCanvas(svgContent: string, options: ExportOptions = {}): Promise<HTMLCanvasElement> {
    try {
        return await svgToCanvasUsingHtml2Canvas(svgContent, options);
    } catch (error) {
        console.warn('html2canvas 失败，使用备用方法:', error);
        return await svgToCanvasUsingImage(svgContent, options);
    }
}

/**
 * 导出为 PNG（高质量）
 */
export async function exportPng(svgContent: string, filename: string, scale = 2): Promise<void> {
    try {
        const canvas = await svgToCanvas(svgContent, { scale, backgroundColor: '#ffffff' });
        const pngUrl = canvas.toDataURL('image/png', 1.0);
        downloadFile(pngUrl, `${filename}.png`);
    } catch (error) {
        console.error('PNG 导出失败:', error);
        throw new Error('PNG 导出失败，请重试');
    }
}

/**
 * 复制 PNG 到剪贴板
 */
export async function copyPngToClipboard(svgContent: string, scale = 2): Promise<void> {
    const canvas = await svgToCanvas(svgContent, { scale, backgroundColor: '#ffffff' });

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
                } catch (err) {
                    reject(err);
                }
            },
            'image/png',
            1.0
        );
    });
}

/**
 * 复制 SVG 到剪贴板
 */
export async function copySvgToClipboard(svgContent: string): Promise<void> {
    try {
        await navigator.clipboard.writeText(svgContent);
    } catch (err) {
        throw new Error('复制失败');
    }
}

/**
 * 导出为 HTML
 */
export function exportHtml(svgContent: string, filename: string, title = 'Diagram'): void {
    const processedSvg = preprocessSvg(svgContent);
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
    ${processedSvg}
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
 * 导出为 Markdown
 */
export function exportMarkdown(code: string, engine: string, filename: string): void {
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
        vegalite: 'json',
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
 * 导出源代码
 */
export function exportSourceCode(code: string, engine: string, filename: string): void {
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
        vegalite: 'vl.json',
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
