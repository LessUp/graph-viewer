# GraphViewer

<p align="center">
  <a href="https://github.com/LessUp/graph-viewer/actions/workflows/ci.yml">
    <img src="https://github.com/LessUp/graph-viewer/actions/workflows/ci.yml/badge.svg" alt="CI">
  </a>
  <a href="https://github.com/LessUp/graph-viewer/actions/workflows/pages.yml">
    <img src="https://github.com/LessUp/graph-viewer/actions/workflows/pages.yml/badge.svg" alt="Deploy">
  </a>
  <img src="https://img.shields.io/badge/version-1.0.0-blue.svg" alt="Version">
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT">
  </a>
  <img src="https://img.shields.io/badge/node-20+-green.svg" alt="Node: 20+">
</p>

<p align="center">
  <a href="README.md">English</a> | <b>简体中文</b>
</p>

---

## 🎯 概览

GraphViewer 是一个现代化的图表可视化工具，支持 **16+ 种图表引擎**，采用本地与服务端混合渲染。

基于 **Next.js 15** + **React 19** + **TypeScript** 构建，提供创建、预览和导出图表的无缝体验。

## ✨ 特性

- 🎨 **16+ 种图表引擎**：Mermaid、PlantUML、Graphviz、D2 等
- ⚡ **混合渲染**：本地 WASM 保证速度 + 远程 Kroki 支持更多格式
- 💾 **多格式导出**：SVG、PNG (2x/4x)、PDF、HTML、Markdown
- 🔗 **分享链接**：使用 LZ-string 压缩编码的 URL 分享
- 🖥️ **实时预览**：防抖实时预览，支持手动渲染
- 📁 **多图工作区**：管理多个图表，本地持久化
- 🕐 **版本历史**：自动保存快照，支持恢复
- 🤖 **AI 助手**：可选的 AI 代码分析与生成功能

## 🚀 快速开始

### 环境要求

- Node.js 20+ 和 npm 10+

### 安装

```bash
# 克隆仓库
git clone https://github.com/LessUp/graph-viewer.git
cd graph-viewer

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000)。

## 📦 安装与部署

### Docker（推荐）

```bash
# 生产环境配合自建 Kroki
docker compose --profile prod --profile kroki up -d

# 开发环境
docker compose --profile dev up
```

### GitHub Pages

静态导出用于 GitHub Pages 部署。详情参见 [部署指南](docs/zh-CN/03-deployment/02-github-pages.md)。

### 自建服务

部署自己的 Kroki 实例以确保完全隐私。参见 [自建指南](docs/zh-CN/03-deployment/03-self-hosted.md)。

## 🛠️ 开发

```bash
# 开发服务器
npm run dev

# 构建
npm run build              # 生产构建（包含 API 路由）
npm run build:static       # 静态导出（用于 GitHub Pages）

# 测试
npm run test               # 运行单元测试
npm run test:watch         # 监听模式
npm run test:smoke         # 冒烟测试（端点可用性）

# 代码质量
npm run lint               # ESLint 检查
npm run typecheck          # TypeScript 类型检查
npm run format             # Prettier 格式化
```

## 📚 文档

### 📖 中文文档

- [文档中心](docs/zh-CN/README.md)
- [快速开始](docs/zh-CN/01-getting-started/01-quick-start.md)
- [架构概览](docs/zh-CN/01-getting-started/03-architecture.md)
- [开发指南](docs/zh-CN/02-development/)
- [部署指南](docs/zh-CN/03-deployment/)
- [功能特性](docs/zh-CN/04-features/)

### 📖 English Documentation

- [Documentation Center](docs/en/README.md)
- [Quick Start](docs/en/01-getting-started/01-quick-start.md)
- [Architecture Overview](docs/en/01-getting-started/03-architecture.md)
- [Development Guide](docs/en/02-development/)
- [Deployment Guide](docs/en/03-deployment/)
- [Features](docs/en/04-features/)

## 🏗️ 架构

```
app/
├── page.tsx                 # 主页面组合
├── layout.tsx               # 根布局  
├── globals.css              # 全局样式
└── api/
    ├── render/route.ts      # Kroki 代理（带缓存）
    └── healthz/route.ts     # 健康检查端点

components/                   # React 组件
├── EditorPanel.tsx          # 代码编辑器和控制
├── PreviewPanel.tsx         # 图表预览
├── PreviewToolbar.tsx       # 导出和缩放控制
└── ...

hooks/                        # 自定义 React hooks
├── useDiagramState.ts       # 状态管理
├── useDiagramRender.ts      # 渲染逻辑
└── ...

lib/                          # 工具模块
├── diagramConfig.ts         # 引擎/格式定义
├── diagramSamples.ts        # 示例代码片段
└── exportUtils.ts           # 导出实现
```

## 🔧 支持的引擎

| 分类 | 引擎 |
|------|------|
| 常用 | Mermaid、PlantUML、Graphviz、D2 |
| 流程图 | Flowchart.js、BlockDiag、ActDiag |
| 时序与网络 | SeqDiag、NwDiag |
| 数据可视化 | Vega、Vega-Lite、WaveDrom |
| ASCII 艺术 | Ditaa、SVGBob、Nomnoml |
| 数据建模 | ERD |

## 🛡️ 安全

- **本地渲染**：Mermaid 使用 `securityLevel: 'strict'`；Graphviz WASM 在浏览器中执行
- **远程渲染**：`/api/render` 转发到 Kroki，带内存缓存
- **SVG 清洗**：DOMPurify 在渲染前清洗所有 SVG 内容
- **输入验证**：服务端验证引擎、格式和代码长度

**建议**：敏感内容使用本地渲染，或自建 Kroki。

## 🤝 贡献

欢迎贡献！提交 Pull Request 前请阅读我们的 [开发规范](docs/zh-CN/02-development/02-guidelines.md)。

## 📄 许可

GraphViewer 基于 [MIT License](LICENSE) 发布。

---

<p align="center">
  由 GraphViewer 团队用 ❤️ 制作
</p>
