# 导出能力说明

> 本文描述 **当前导出实现与限制**，不是一次性历史变更记录。

## 1. 当前支持的导出能力

在当前 UI 中，导出入口位于 `PreviewToolbar.tsx`。

### 1.1 文件导出

- SVG 矢量图
- PNG 高清（2x）
- PNG 超清（4x）
- HTML 网页
- Markdown 文档
- 源代码文件

### 1.2 剪贴板

- 复制 PNG 图片到剪贴板

### 1.3 当前不支持的内容

- 工具栏中 **没有单独的 PDF 导出按钮**
- 项目支持 `pdf` 作为渲染 / 预览格式，但当前导出工具链并未提供 PDF 文件导出

## 2. 使用前提

当前导出菜单依赖 **SVG 预览内容**：

- 如果当前图表能生成 SVG 预览，导出菜单可用
- 如果当前预览格式切换到 `png` 或 `pdf`，导出菜单会禁用
- 需要切回 `svg` 后再导出 SVG / PNG / HTML / Markdown / 源码

这与 `PreviewPanel.tsx` 向 `PreviewToolbar.tsx` 传递的 `svgContent` 逻辑一致。

## 3. 实现入口

- 交互入口：`components/PreviewToolbar.tsx`
- 导出实现：`lib/exportUtils.ts`

对应函数：

- `exportSvg()`
- `exportPng()`
- `copyPngToClipboard()`
- `exportHtml()`
- `exportMarkdown()`
- `exportSourceCode()`

## 4. 关键实现细节

### 4.1 SVG 预处理

`preprocessSvg()` 会在导出前做几件事：

- 确保 SVG 命名空间完整
- 处理样式标签
- 尝试把部分关键计算样式内联到元素属性上
- 在缺失宽高时根据 `viewBox` 补全尺寸
- 按需扩展 `viewBox` 以加入 padding

### 4.2 PNG 生成策略

PNG 导出采用双重策略：

1. 优先 `html2canvas`
2. 失败后回退到原生 `Image + canvas`

这样做的目标是：

- 提高复杂 SVG 的兼容性
- 在 `html2canvas` 失败时保留兜底能力

### 4.3 PNG 清晰度

当前 UI 默认提供两档：

- `2x`
- `4x`

放大倍数越高：

- 图片越清晰
- 文件越大
- 导出耗时也可能更长

### 4.4 HTML / Markdown / 源码导出

- `exportHtml()`
  - 生成一个独立 HTML 文件并内嵌 SVG
- `exportMarkdown()`
  - 根据引擎映射语言标识并导出 markdown code fence
- `exportSourceCode()`
  - 根据引擎映射文件扩展名

## 5. 什么时候选哪种格式

- **SVG**
  - 适合继续编辑、放大查看、嵌入网页
- **PNG 2x**
  - 适合一般截图分享
- **PNG 4x**
  - 适合高清展示、打印前素材
- **HTML**
  - 适合把图表作为独立网页交付
- **Markdown**
  - 适合文档仓库、知识库、说明文档
- **源代码**
  - 适合保存原始图表语法

## 6. 已知限制

- Clipboard API 依赖浏览器支持与安全上下文
- 极大尺寸的 SVG 可能导致 canvas 内存压力
- 某些复杂滤镜 / 字体 / 外部资源样式未必能 100% 保真
- 当前导出菜单与 SVG 预览绑定，不是完全独立于预览格式的导出系统

## 7. 建议的手工验证项

- Mermaid / Graphviz / PlantUML 等不同引擎在 SVG 下的导出表现
- 2x 与 4x 的清晰度和文件体积差异
- 中文、emoji、特殊字符的显示
- 剪贴板能力在不同浏览器中的表现
- HTML / Markdown / 源码导出的文件名和扩展名是否正确

## 8. 如果后续要继续增强

优先建议从这几个方向继续：

- 让导出菜单不再强依赖 SVG 预览
- 为 `app/api/render/route.ts` 和导出链路补更完整测试
- 评估是否增加 PDF 文件导出
- 为大图导出增加更明确的进度与错误提示
