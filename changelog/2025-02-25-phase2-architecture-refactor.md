# 阶段 2：架构重构

**日期**：2025-02-25

## 变更内容

### 提取 AppHeader 组件
- 新增 `components/AppHeader.tsx`
- 封装 logo、导入/导出工作区按钮、设置按钮、GitHub 链接
- 文件导入逻辑（`<input type="file">` + 解析）内聚到组件内部

### 提取 DiagramList 组件
- 新增 `components/DiagramList.tsx`
- 封装图表列表、排序逻辑、新建/重命名/删除操作按钮
- 接受回调 props，不直接操作状态

### 提取 CollapsedSidebar 组件
- 新增 `components/CollapsedSidebar.tsx`
- 封装侧边栏折叠态 UI（展开按钮、新建按钮、图表计数）

### 添加 ErrorBoundary 组件
- 新增 `components/ErrorBoundary.tsx`
- React class component 实现全局错误捕获
- 提供友好的错误展示 UI 和"重试"按钮
- 包裹在 `page.tsx` 的最外层

### 简化 page.tsx
- 从 **426 行** 精简至 **~250 行**（减少约 40%）
- 所有事件处理函数改用 `useCallback` 包装，减少不必要的子组件重渲染
- 移除直接的 `format` / `setFormat` 解构和强制 SVG 的 `useEffect`
- JSX 模板仅保留组合逻辑，无内联 UI 代码

### 清理 format 冗余
- `page.tsx` 不再解构 `format` 和 `setFormat`
- `useDiagramState` 内部保留 format 字段以维持数据兼容性
- 渲染始终传入 `'svg'` 硬编码值

## 新增文件
- `components/AppHeader.tsx`
- `components/DiagramList.tsx`
- `components/CollapsedSidebar.tsx`
- `components/ErrorBoundary.tsx`

## 修改文件
- `app/page.tsx`（大幅简化）

## 后续步骤
- 阶段 3：UX/UI 现代化（暗黑模式、键盘快捷键等）
- 阶段 4：DevOps 与质量（Dockerfile 优化、测试框架）
