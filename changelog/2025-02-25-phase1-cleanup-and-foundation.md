# 阶段 1：清理与基础设施重构

**日期**：2025-02-25

## 变更内容

### 删除死文件
- 移除 `lib/exportUtils.backup.ts`（旧备份文件）
- 移除 `EXPORT_FIX_README.md`、`EXPORT_FIX_SUMMARY.md`（过时的修复文档）
- 移除 `verify-export-fix.sh`、`test-export.html`（临时测试脚本）

### 图标系统统一 — 内联 SVG → lucide-react
- **page.tsx**：替换 12 处内联 SVG 为 lucide-react 图标（Check, Palette, Upload, Download, Settings, Github, ChevronsRight/Left, Plus, Layers, Pencil, Trash2）
- **EditorPanel.tsx**：替换 4 处（PlayCircle, Loader2, Copy, AlertCircle）
- **PreviewPanel.tsx**：替换 3 处（Loader2, X, Image）
- **PreviewToolbar.tsx**：替换 7 处（ZoomIn, ZoomOut, RotateCcw, Maximize, Download, Loader2, Check, Copy）
- **SettingsModal.tsx**：替换 4 处（Settings, X, Info, Palette）
- **VersionHistoryPanel.tsx**：替换 7 处（Loader2, Clock, Plus, Pencil, ChevronDown, RotateCcw, Trash2）
- **AIAssistantPanel.tsx**：替换 8 处（Zap, Loader2, Lightbulb, Pencil, AlertTriangle, CheckCircle, AlertCircle, Key）

### 修复 next.config.js
- 移除 `typedRoutes: true`（实验性特性，可能导致构建问题）

### 字体加载优化
- 将 Google Fonts 的 CSS `@import` 替换为 `next/font` 方案
- 在 `layout.tsx` 中添加 `JetBrains_Mono` 字体配置（CSS 变量 `--font-jetbrains-mono`）
- 更新 `CodeEditor.tsx` 中的 `fontFamily` 引用为 CSS 变量
- 消除渲染阻塞的外部 CSS 请求，提升首屏加载性能

### 提取 Toast 组件
- 新增 `hooks/useToast.ts`：可复用的 Toast 状态管理 hook，支持 success/error/info 三种类型
- 新增 `components/Toast.tsx`：独立的 Toast UI 组件
- 更新 `page.tsx` 使用新的 Toast 系统，移除临时的内联实现

### 添加 ESLint + Prettier 配置
- 新增 `.eslintrc.json`：基于 `next/core-web-vitals` + `next/typescript` + `prettier`
- 新增 `.prettierrc.json`：统一代码风格（单引号、尾逗号、100 字符行宽、Tailwind CSS 插件）
- 更新 `package.json`：
  - 添加 `lint`、`lint:fix`、`format`、`format:check` 脚本
  - 添加 devDependencies：eslint, eslint-config-next, eslint-config-prettier, prettier, prettier-plugin-tailwindcss
  - 添加 `@types/dompurify` 类型定义

## 影响范围
- **组件**：所有 7 个组件文件已更新图标引用
- **配置**：next.config.js, package.json, tailwind.config.js（未变更）, 新增 ESLint/Prettier 配置
- **新文件**：Toast.tsx, useToast.ts, .eslintrc.json, .prettierrc.json
- **删除文件**：5 个死文件

## 后续步骤
- 运行 `npm install` 安装新增的 devDependencies
- 运行 `npm run lint` 和 `npm run format` 进行首次全量检查和格式化
- 进入阶段 2：架构重构
