---
trigger: glob
globs:
  - app/**/*.ts
  - app/**/*.tsx
  - components/**/*.tsx
  - hooks/**/*.ts
---

# GraphViewer 前端规则

- 只有在使用 React hooks、事件处理、`window` / `document` / `navigator` / localStorage 等浏览器 API 时才添加 `'use client'`。
- App Router 路由应延续现有处理方式：优先返回 `NextResponse`，并保留当前的缓存、超时、错误映射策略。
- 预览与导出链路要保持一致：
  - SVG 预览依赖 `sanitizedSvg`
  - PNG / PDF 预览依赖 `base64` 与 `contentType`
  - `PreviewToolbar` 只接收可导出的 SVG 内容
- 涉及设置、侧边栏、工作区导入导出时，先检查这些文件的数据流和兼容性：
  - `app/page.tsx`
  - `components/AppHeader.tsx`
  - `hooks/useSettings.ts`
  - `hooks/useDiagramState.ts`
- 如果删除、重命名或移动文件，同时更新其测试、README、ROADMAP、TODO 和 `.windsurf` 相关引用。
