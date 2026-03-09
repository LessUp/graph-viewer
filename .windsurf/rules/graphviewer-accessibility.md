---
trigger: glob
globs:
  - components/**/*.tsx
  - app/**/*.tsx
---

# GraphViewer 无障碍规则

## 键盘导航

- 所有交互元素（按钮、选择器、标签页、模态框）必须可通过键盘操作。
- 模态框（`SettingsModal`）打开时应 trap focus，关闭时恢复焦点。
- 侧边栏标签页（`SidebarTabs`）支持方向键切换。

## ARIA 属性

- 图标按钮必须有 `aria-label` 或可见文本标签。
- 选择器（引擎、格式）使用语义化的 `<select>` 或带 `role` 属性的自定义组件。
- Toast 通知使用 `role="alert"` 或 `aria-live="polite"`。
- 错误提示关联到对应的输入元素（`aria-describedby`）。

## 颜色与对比度

- 文本与背景的对比度至少满足 WCAG AA（4.5:1 正文、3:1 大文本）。
- 不要仅用颜色传达状态信息（如错误状态），同时使用图标或文本。
- 暗色/亮色主题切换时确保对比度仍然达标。

## 语义化标记

- 使用正确的 HTML 语义标签：`<button>` 用于操作、`<a>` 用于导航、`<nav>` 用于导航区域。
- 不要用 `<div onClick>` 替代 `<button>`。
- 页面标题层级（h1 → h2 → h3）保持正确嵌套。

## 预览区域

- SVG 预览区域添加 `role="img"` 和 `aria-label`，描述当前图表类型。
- 加载状态使用 `aria-busy="true"`。
- 渲染错误信息应对屏幕阅读器可见。
