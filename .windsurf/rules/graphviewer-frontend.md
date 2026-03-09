---
trigger: glob
globs:
  - app/**/*.ts
  - app/**/*.tsx
  - components/**/*.tsx
  - hooks/**/*.ts
  - lib/**/*.ts
---

# GraphViewer 前端规则

## 'use client' 指令

- 只有在使用 React hooks、事件处理、`window` / `document` / `navigator` / localStorage 等浏览器 API 时才添加 `'use client'`。
- `lib/` 下的纯逻辑模块不应添加 `'use client'`。

## 预览与导出链路

预览与导出链路要保持一致：

- SVG 预览依赖 `sanitizedSvg`
- PNG / PDF 预览依赖 `base64` 与 `contentType`
- `PreviewToolbar` 只接收可导出的 SVG 内容
- 导出映射定义在 `lib/exportUtils.ts`，修改时同步检查 `PreviewToolbar`

## 关键数据流

- **图表状态**: `useDiagramState` → `page.tsx` → `EditorPanel` / `PreviewPanel` / `DiagramList`
- **渲染**: `useDiagramRender` ← `useLivePreview`（debounced 自动渲染）
- **设置**: `useSettings` → `SettingsModal`（UI）、`useLivePreview`（debounceMs）、`CodeEditor`（fontSize）
- **侧边栏**: `page.tsx` 管理 tab/collapsed 状态 → `SidebarTabs` / `CollapsedSidebar`
- **版本历史**: `useVersionHistory` + `useVersionActions` → `VersionHistoryPanel`
- **工作区**: `useWorkspaceActions` → `AppHeader`（导入/导出）

涉及以上数据流时，先检查上下游文件的兼容性。

## 文件变更副作用

- 如果删除、重命名或移动文件，同时更新其测试、README、ROADMAP、TODO 和 `.windsurf` 相关引用。
- 修改 hook 的返回值类型时，检查所有调用方（`page.tsx` 是主要消费者）。
