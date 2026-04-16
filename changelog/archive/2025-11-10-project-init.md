# 项目初始化与首次部署

**日期**：2025-11-10

## 变更内容

### 项目骨架

- 初始化 Next.js 14 + Tailwind CSS 项目
- 新增 `/api/render` 接口，代理 Kroki 服务，支持 mermaid / plantuml / graphviz / flowchart，输出 svg / png / pdf
- 新增前端编辑器与预览页面，支持渲染与下载
- Next.js 首次启动自动更新 `tsconfig.json`（`esModuleInterop`、`resolveJsonModule`、`isolatedModules`、`plugins`、`.next/types`）

### 后端能力

- `/api/render` 支持通过环境变量 `KROKI_BASE_URL` 指向自建 Kroki 服务（默认 `https://kroki.io`）

### 前端能力

- 新增 Mermaid 本地兜底渲染：当 Kroki 不可用时，mermaid / flowchart 在 SVG 格式下使用 mermaid 本地渲染
- PDF 格式使用 iframe 预览，提升浏览器兼容性

### 依赖与配置

- 将 react / react-dom 版本固定为 `^18.2.0`，确保与 Next 14 兼容

### 部署

- 新增 `netlify.toml` 配置（`@netlify/plugin-nextjs`，Node 18）
- 使用 Netlify CLI 完成首次部署，站点名称 `lessup-graphviewer-20251110`

## 影响范围

- 全量新建项目结构、前后端核心功能、部署配置
