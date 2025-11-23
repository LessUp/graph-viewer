
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
 * 导出为 SVG 文件
 */
export function exportSvg(svgContent: string, filename: string) {
  const url = svgToDataUrl(svgContent);
  downloadFile(url, `${filename}.svg`);
  URL.revokeObjectURL(url);
}

/**
 * 导出为 PNG 文件
 * @param svgContent SVG 内容字符串
 * @param filename 文件名（不含后缀）
 * @param scale 缩放倍数（用于提高分辨率）
 */
export async function exportPng(svgContent: string, filename: string, scale = 2): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // 处理 SVG 内容，确保包含 xmlns，避免某些浏览器渲染失败
    const cleanSvg = svgContent.includes('xmlns="http://www.w3.org/2000/svg"') 
      ? svgContent 
      : svgContent.replace(/<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    
    const url = svgToDataUrl(cleanSvg);
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        // 获取 SVG 的原始尺寸
        const width = img.width || 800;
        const height = img.height || 600;
        
        canvas.width = width * scale;
        canvas.height = height * scale;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('无法获取 Canvas 上下文');
        
        // 绘制白色背景（PNG透明背景在某些查看器下体验不好，也可设为透明）
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const pngUrl = canvas.toDataURL('image/png');
        downloadFile(pngUrl, `${filename}.png`);
        
        URL.revokeObjectURL(url);
        resolve();
      } catch (e) {
        reject(e);
      }
    };
    
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(new Error('SVG 图片加载失败'));
    };
    
    img.src = url;
  });
}

/**
 * 复制 PNG 到剪贴板
 */
export async function copyPngToClipboard(svgContent: string, scale = 2): Promise<void> {
    return new Promise((resolve, reject) => {
    const img = new Image();
    const cleanSvg = svgContent.includes('xmlns="http://www.w3.org/2000/svg"') 
      ? svgContent 
      : svgContent.replace(/<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    
    const url = svgToDataUrl(cleanSvg);
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const width = img.width || 800;
        const height = img.height || 600;
        canvas.width = width * scale;
        canvas.height = height * scale;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Context null');
        
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob(async (blob) => {
          if (!blob) {
            reject(new Error('Canvas to Blob failed'));
            return;
          }
          try {
            const item = new ClipboardItem({ 'image/png': blob });
            await navigator.clipboard.write([item]);
            URL.revokeObjectURL(url);
            resolve();
          } catch (err) {
            reject(err);
          }
        }, 'image/png');
      } catch (e) {
        reject(e);
      }
    };
    
    img.onerror = () => reject(new Error('Image load failed'));
    img.src = url;
  });
}
