# 2025-11-18 前端重构：Hooks 与组件拆分

- 新增业务 Hook：
  - `hooks/useDiagramState.ts`：集中管理 `engine`、`format`、`code` 与 `codeStats`，并负责从 URL Query 与 `localStorage` 恢复/持久化状态。
  - `hooks/useDiagramRender.ts`：封装本地渲染（Mermaid/Graphviz）、远程渲染 `/api/render`、下载逻辑与 `AbortController`，对外暴露 `renderDiagram`/`downloadDiagram` 等操作。
- 新增配置与示例：
  - `lib/diagramSamples.ts`：将不同引擎的示例代码集中存放，供编辑器与 Hook 共用。
- 新增 UI 组件：
  - `components/EditorPanel.tsx`：承载编辑器左侧区域的所有 UI（引擎/格式选择、按钮、代码编辑区与错误展示）。
  - `components/PreviewPanel.tsx`：承载右侧预览区域 UI（当前引擎/格式标签、加载态、空态，以及 SVG/PNG/PDF 预览）。
- 重写 `app/page.tsx`：
  - 使用 `useDiagramState` 与 `useDiagramRender` 管理业务状态与渲染流程。
  - 将原本内联的编辑区/预览区 JSX 替换为 `EditorPanel` 与 `PreviewPanel` 组件调用，页面本身主要负责布局与组件组合。
  - 保持原有行为不变：URL 分享、`localStorage` 恢复、本地渲染优先、远程 Kroki 回退和下载逻辑与此前版本一致。
