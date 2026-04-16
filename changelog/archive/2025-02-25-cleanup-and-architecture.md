# 清理、基础设施与架构重构

**日期**：2025-02-25

## 阶段 1：清理与基础设施

### 删除死文件

- 移除 `lib/exportUtils.backup.ts`、`EXPORT_FIX_README.md`、`EXPORT_FIX_SUMMARY.md`、`verify-export-fix.sh`、`test-export.html`

### 图标系统统一

- 全部 7 个组件文件的内联 SVG 替换为 lucide-react 图标（共约 45 处）

### 字体加载优化

- Google Fonts CSS `@import` 替换为 `next/font` 方案（`JetBrains_Mono`，CSS 变量 `--font-jetbrains-mono`）
- 消除渲染阻塞的外部 CSS 请求

### Toast 系统

- 新增 `hooks/useToast.ts`（可复用状态管理 hook，支持 success / error / info）
- 新增 `components/Toast.tsx`（独立 UI 组件）

### 代码规范

- 新增 `.eslintrc.json`（`next/core-web-vitals` + `next/typescript` + `prettier`）
- 新增 `.prettierrc.json`（单引号、尾逗号、100 字符行宽、Tailwind CSS 插件）
- `package.json` 添加 `lint`、`lint:fix`、`format`、`format:check` 脚本

### 配置修复

- 移除 `next.config.js` 中的 `typedRoutes: true`（实验性特性）

## 阶段 2：架构重构

### 组件拆分

- **`components/AppHeader.tsx`**：封装 logo、导入 / 导出工作区按钮、设置按钮、GitHub 链接
- **`components/DiagramList.tsx`**：封装图表列表、排序逻辑、新建 / 重命名 / 删除操作
- **`components/CollapsedSidebar.tsx`**：封装侧边栏折叠态 UI
- **`components/ErrorBoundary.tsx`**：React class component 全局错误捕获

### page.tsx 精简

- 从约 426 行精简至约 250 行（减少约 40%）
- 所有事件处理函数改用 `useCallback` 包装
- 移除 `format` / `setFormat` 解构和强制 SVG 的 `useEffect`
- JSX 仅保留组合逻辑

## 影响范围

- **新增文件**：`AppHeader.tsx`、`DiagramList.tsx`、`CollapsedSidebar.tsx`、`ErrorBoundary.tsx`、`Toast.tsx`、`useToast.ts`、`.eslintrc.json`、`.prettierrc.json`
- **修改文件**：`page.tsx`（大幅简化）、`next.config.js`、`layout.tsx`、`CodeEditor.tsx`、`package.json`
- **删除文件**：5 个过时文件
