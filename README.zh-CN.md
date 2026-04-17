# GraphViewer

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue.svg" alt="版本">
  <a href="https://github.com/LessUp/graph-viewer/blob/master/LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="许可证: MIT">
  </a>
  <a href="https://github.com/LessUp/graph-viewer/actions/workflows/ci.yml">
    <img src="https://github.com/LessUp/graph-viewer/actions/workflows/ci.yml/badge.svg" alt="CI">
  </a>
  <a href="https://github.com/LessUp/graph-viewer/actions/workflows/pages.yml">
    <img src="https://github.com/LessUp/graph-viewer/actions/workflows/pages.yml/badge.svg" alt="部署">
  </a>
  <img src="https://img.shields.io/badge/Next.js-15-black.svg" alt="Next.js 15">
  <img src="https://img.shields.io/badge/React-19-61DAFB.svg" alt="React 19">
  <img src="https://img.shields.io/badge/Node.js-22+-339933.svg" alt="Node: 22+">
</p>

<p align="center">
  <a href="README.md">English</a> | <b>简体中文</b>
</p>

<p align="center">
  <strong>🚀 在线体验：</strong> <a href="https://lessup.github.io/graph-viewer/">GitHub Pages 演示</a>
</p>

---

<p align="center">
  <b>现代化的图表可视化工具，支持 16+ 种引擎、混合渲染和 AI 智能辅助</b>
</p>

<p align="center">
  即时创建、预览和分享图表，享受无缝工作区体验
</p>

---

## ✨ 核心特性

| 类别 | 特性 |
|------|------|
| **🎨 多引擎支持** | Mermaid、PlantUML、Graphviz、D2 等 16+ 种引擎 |
| **⚡ 混合渲染** | 本地 WASM 提速 + 远程 Kroki 广泛支持 |
| **💾 导出选项** | SVG、PNG (2x/4x)、PDF、HTML、Markdown |
| **🔗 即时分享** | LZ-string 压缩 URL，轻松分享图表 |
| **🖥️ 实时预览** | 防抖实时预览，支持手动渲染 |
| **📁 多图工作区** | 管理多个图表，本地持久化存储 |
| **🕐 版本历史** | 自动保存快照，一键恢复 |
| **🤖 AI 助手** | AI 代码分析、生成和修复 |
| **🛡️ 安全优先** | DOMPurify SVG 清洗、严格模式、输入验证 |

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

## 📦 部署

### Docker（推荐）

```bash
# 生产环境配合自建 Kroki
docker compose --profile prod --profile kroki up -d

# 开发环境
docker compose --profile dev up
```

### GitHub Pages

```bash
npm run build:static
```

完整说明参见 [部署指南](docs/zh-CN/03-deployment/02-github-pages.md)。

### 自建 Kroki

部署自己的 Kroki 实例以确保完全隐私。参见 [自建指南](docs/zh-CN/03-deployment/03-self-hosted.md)。

## 🎯 支持的图表引擎

| 分类 | 引擎 |
|------|------|
| **常用** | Mermaid、PlantUML、Graphviz、D2 |
| **流程图** | Flowchart.js、BlockDiag、ActDiag |
| **时序与网络** | SeqDiag、NwDiag |
| **数据可视化** | Vega、Vega-Lite、WaveDrom |
| **ASCII 艺术** | Ditaa、SVGBob、Nomnoml |
| **数据建模** | ERD (DBML)、Structurizr |
| **高级** | C4PlantUML、TikZ、Bytefield、Railroad、Picosat |

## 🛠️ 开发

### 常用命令

```bash
npm run dev              # 开发服务器（端口 3000）
npm run build            # 生产构建（含 API 路由）
npm run build:static     # 静态导出（用于 GitHub Pages）
npm run start            # 生产服务器

# 代码质量
npm run test             # 运行单元测试 (vitest)
npm run test:watch       # 监听模式
npm run test:smoke       # 冒烟测试（端点可用性）
npm run lint             # ESLint 检查
npm run lint:fix         # 自动修复 ESLint 问题
npm run typecheck        # TypeScript 类型检查
npm run bench            # 性能基准测试
```

### 项目结构

```
graph-viewer/
├── app/                          # Next.js App Router
│   ├── page.tsx                  #   主页面
│   ├── layout.tsx                #   根布局
│   ├── globals.css               #   全局样式
│   └── api/                      #   API 路由
│       ├── render/route.ts       #     Kroki 代理（带缓存）
│       └── healthz/route.ts      #     健康检查端点
│
├── components/                   # UI 组件（按领域分组）
│   ├── layout/                   #   AppHeader、Sidebar、ErrorBoundary
│   ├── editor/                   #   CodeEditor、EditorPanel
│   ├── preview/                  #   PreviewPanel、PreviewToolbar
│   ├── sidebar/                  #   DiagramList、SidebarTabs
│   ├── dialogs/                  #   Dialogs、SettingsModal
│   ├── feedback/                 #   Toast
│   ├── ai/                       #   AIAssistantPanel
│   └── version/                  #   VersionHistoryPanel
│
├── hooks/                        # 自定义 React Hooks（10 个）
├── lib/                          # 工具库
├── specs/                        # 规范驱动开发（单一真相源）
│   ├── product/                  #   路线图、待办
│   ├── rfc/                      #   架构决策
│   ├── api/                      #   OpenAPI 规范
│   ├── db/                       #   数据库模式
│   └── testing/                  #   BDD 测试规范
│
├── docs/                         # 用户文档（双语）
│   ├── en/                       #   英文
│   └── zh-CN/                    #   中文
│
└── scripts/                      # 构建与自动化（ESM .mjs）
```

详细架构说明参见 [RFC-0001：核心架构](specs/rfc/0001-core-architecture.md)。

## 📚 文档

完整的中英文文档均可使用：

- [English Documentation](docs/en/README.md)
- [中文文档](docs/zh-CN/README.md)

### 文档章节

| 章节 | 内容 |
|------|------|
| **入门指南** | 快速开始、安装、架构概述 |
| **开发指南** | 环境配置、开发规范、测试 |
| **部署指南** | Docker、GitHub Pages、自建 Kroki |
| **功能说明** | 导出、渲染引擎、AI 助手 |
| **参考手册** | 配置、API 参考 |

## 🏗️ 架构说明

### 混合渲染策略

```
用户输入 → 代码编辑器 → 预览引擎
                   ↓
        ┌──────────┴──────────┐
        ↓                     ↓
  本地 WASM              远程 Kroki
  (Mermaid,              (其他所有
   Graphviz)               引擎)
        ↓                     ↓
        └──────────┬──────────┘
                   ↓
              SVG/PNG/PDF 输出
```

### 规范驱动开发

本项目遵循**规范驱动开发（SDD）**。所有实现细节定义在 `/specs` 目录中：

- [产品路线图](specs/product/roadmap.md) — 开发阶段与规划
- [产品待办](specs/product/todo.md) — 任务 backlog 与优先级
- [核心架构 RFC](specs/rfc/0001-core-architecture.md) — 技术架构决策
- [API 设计 RFC](specs/rfc/0002-api-design.md) — API 设计决策
- [OpenAPI 规范](specs/api/openapi.yaml) — 机器可读的 API 定义
- [数据库模式](specs/db/schema-v1.dbml) — 数据模型与 localStorage 模式
- [测试规范](specs/testing/diagram-render.feature) — BDD 测试规范

## 🔒 安全性

| 层级 | 实现方式 |
|------|----------|
| **本地渲染** | Mermaid `securityLevel: 'strict'`；Graphviz WASM 浏览器隔离 |
| **远程渲染** | `/api/render` 代理到 Kroki，内存缓存（TTL 120s） |
| **SVG 清洗** | DOMPurify 在渲染前清洗所有 SVG 内容 |
| **输入验证** | 服务端验证引擎、格式和代码长度（100KB 限制） |
| **请求安全** | Base URL 白名单、10s 超时、请求去重 |

## 📈 近期变更

完整历史参见 [CHANGELOG.md](CHANGELOG.md)。

| 日期 | 变更 |
|------|------|
| 2026-04-17 | 目录结构优化和工作流改进 |
| 2026-04-17 | 安全修复和自定义对话框实现 |
| 2026-04-16 | 依赖清理与 Node.js 22 升级 |
| 2026-04-06 | 发布前加固与文档补完 |
| 2026-03-10 | 工作流深度标准化 |

## 🤝 贡献

欢迎贡献！请阅读 [贡献指南](CONTRIBUTING.md) 了解开发规范。

### 如何贡献

1. **Fork** 本仓库
2. **创建** 功能分支 (`git checkout -b feature/amazing-feature`)
3. **提交** 更改 (`git commit -m '添加功能'`)
4. **推送** 到分支 (`git push origin feature/amazing-feature`)
5. **提交** Pull Request

## 📄 许可证

基于 [MIT License](LICENSE) 分发。

## 🙏 致谢

- [Mermaid](https://mermaid.js.org/) - 图表绘制和可视化工具
- [Kroki](https://kroki.io/) - 统一图表渲染 API
- [CodeMirror](https://codemirror.net/) - 浏览器代码编辑器
- [Next.js](https://nextjs.org/) - React 框架

---

<p align="center">
  由 GraphViewer 团队用 ❤️ 制作
</p>
