/**
 * 文件下载工具
 *
 * 提供文件下载相关的副作用函数
 */

/**
 * 下载文件（通过 URL）
 *
 * @param href 文件 URL 或 data URL
 * @param filename 文件名
 */
export function downloadFile(href: string, filename: string): void {
  const a = document.createElement('a');
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/**
 * 从 Blob 创建并下载文件（自动管理 Object URL 生命周期）
 *
 * @param blob Blob 对象
 * @param filename 文件名
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  downloadFile(url, filename);
  // 延迟释放 URL，确保浏览器有足够时间处理下载
  setTimeout(() => URL.revokeObjectURL(url), 100);
}
