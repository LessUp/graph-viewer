# 界面交互深度优化

**日期**：2025-11-23

## 变更内容

### 预览交互升级

- 重写 `PreviewPanel`，支持 SVG 无限缩放与自由平移
- 新增 `PreviewToolbar` 悬浮工具栏（放大、缩小、重置视图）
- 支持鼠标滚轮缩放（Ctrl + 滚轮）及拖拽平移

### 导出功能增强

- 新增 `lib/exportUtils.ts`，基于 Canvas 实现纯前端 SVG → PNG 转换
- 支持直接下载 SVG 矢量文件
- 支持下载高清（2x）和超清（4x）PNG 图片
- 支持一键复制渲染图片到剪贴板
- 导出直接利用当前预览的 SVG 数据，无需后端重新渲染

### 界面布局优化

- 重构 `EditorPanel`，移除冗余的格式选择和下载按钮（已迁移至预览区）
- 优化 `page.tsx` 整体布局，强化左右分栏，提升大屏空间利用率
- 强制默认使用 SVG 格式渲染，确保最佳预览质量

## 影响范围

- **新增文件**：`lib/exportUtils.ts`、`components/PreviewToolbar.tsx`
- **修改文件**：`PreviewPanel.tsx`、`EditorPanel.tsx`、`page.tsx`
