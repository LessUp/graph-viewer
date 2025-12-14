# 导出功能改进文档

## 问题分析

原有的导出功能存在以下问题：

1. **SVG 样式丢失**：导出时 CSS 样式可能无法正确保留
2. **PNG 质量不佳**：使用简单的 Image 对象转换，对复杂 SVG 支持不足
3. **字体渲染问题**：自定义字体可能无法正确显示
4. **兼容性问题**：某些浏览器下导出失败

## 改进方案

### 1. 增强的 SVG 预处理

```typescript
function preprocessSvg(svgContent: string, options: ExportOptions = {}): string
```

**改进点：**
- ✅ 确保所有必要的 XML 命名空间（xmlns, xmlns:xlink）
- ✅ 将 CSS 样式内联到元素属性中
- ✅ 正确处理 CDATA 包裹的样式
- ✅ 自动补全缺失的宽高属性
- ✅ 支持自定义内边距

### 2. 双重转换策略

**主要方法：html2canvas**
- 使用 `html2canvas` 库进行高质量渲染
- 支持复杂的 SVG 结构和样式
- 更好的字体和颜色处理

**备用方法：原生 Image**
- 当 html2canvas 失败时自动回退
- 使用原生 Image 对象加载 SVG
- 确保基本功能可用

```typescript
async function svgToCanvas(svgContent: string, options: ExportOptions = {}): Promise<HTMLCanvasElement>
```

### 3. 高质量 PNG 导出

**优化配置：**
- 默认 2x 缩放（可选 4x 超清）
- 质量设置为 0.95（接近无损）
- 启用高质量图像平滑（imageSmoothingQuality: 'high'）
- 白色背景确保兼容性

```typescript
export async function exportPng(svgContent: string, filename: string, scale = 2): Promise<void>
```

### 4. 样式内联优化

**关键样式属性：**
- fill（填充色）
- stroke（描边色）
- stroke-width（描边宽度）
- font-family（字体）
- font-size（字号）
- font-weight（字重）
- opacity（透明度）

这些样式会从计算样式中提取并内联到 SVG 元素上，确保导出时不丢失。

## 使用方法

### 导出 SVG

```typescript
import { exportSvg } from '@/lib/exportUtils';

exportSvg(svgContent, 'diagram', {
  padding: 20,
  backgroundColor: '#ffffff'
});
```

### 导出高质量 PNG

```typescript
import { exportPng } from '@/lib/exportUtils';

// 标准质量 (2x)
await exportPng(svgContent, 'diagram', 2);

// 超清质量 (4x)
await exportPng(svgContent, 'diagram', 4);
```

### 复制到剪贴板

```typescript
import { copyPngToClipboard } from '@/lib/exportUtils';

await copyPngToClipboard(svgContent, 2);
```

## 导出选项

```typescript
type ExportOptions = {
  scale?: number;           // 缩放倍数 (1-8)，默认 2
  quality?: number;         // 图片质量 (0-1)，默认 0.95
  backgroundColor?: string; // 背景颜色，默认 '#ffffff'
  padding?: number;         // 内边距（像素），默认 20
  watermark?: string;       // 水印文字
  maxWidth?: number;        // 最大宽度限制
  maxHeight?: number;       // 最大高度限制
};
```

## 支持的导出格式

- ✅ **SVG** - 矢量图，无损质量
- ✅ **PNG** - 高质量位图，支持透明
- ✅ **HTML** - 独立网页文件
- ✅ **Markdown** - 包含源代码的文档
- ✅ **源代码** - 原始图表代码

## 性能优化

1. **异步处理**：所有导出操作都是异步的，不会阻塞 UI
2. **资源清理**：自动清理临时 DOM 元素和 Blob URL
3. **错误处理**：完善的错误捕获和回退机制
4. **内存管理**：及时释放不再使用的资源

## 兼容性

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## 测试建议

1. 测试不同类型的图表（Mermaid, PlantUML, Graphviz 等）
2. 测试不同的缩放级别（1x, 2x, 4x）
3. 测试包含自定义字体的图表
4. 测试大型复杂图表
5. 测试剪贴板功能

## 已知限制

1. 某些浏览器可能不支持剪贴板 API
2. 非常大的图表（>10000x10000px）可能导致内存问题
3. 某些特殊的 SVG 效果（如滤镜）可能无法完美导出

## 未来改进方向

- [ ] 支持 PDF 导出（使用 jsPDF）
- [ ] 支持批量导出
- [ ] 添加导出进度提示
- [ ] 支持自定义水印位置和样式
- [ ] 支持导出预览
