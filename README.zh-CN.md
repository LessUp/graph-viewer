# GraphViewer

[![CI](https://github.com/LessUp/graph-viewer/actions/workflows/ci.yml/badge.svg)](https://github.com/LessUp/graph-viewer/actions/workflows/ci.yml)
[![Deploy](https://github.com/LessUp/graph-viewer/actions/workflows/pages.yml/badge.svg)](https://github.com/LessUp/graph-viewer/actions/workflows/pages.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

[English](README.md) | 简体中文

一站式图形语法可视化工具，支持 **16 种图表引擎**，提供本地与服务端混合渲染。

## 支持的引擎

| 分类 | 引擎 |
|------|------|
| 常用 | Mermaid, PlantUML, Graphviz (DOT), D2 |
| 流程图系列 | Flowchart.js, BlockDiag, ActDiag |
| 时序与网络 | SeqDiag, NwDiag |
| 数据可视化 | Vega, Vega-Lite, WaveDrom |
| ASCII 艺术 | Ditaa, SVGBob, Nomnoml |
| 数据建模 | ERD |

## 功能特性

- **混合渲染**：本地 Mermaid/Graphviz WASM 渲染保证速度 + 远程 Kroki 支持更多格式
- **多格式导出**：SVG、PNG (2x/4x)、PDF、HTML、Markdown、源代码
- **实时预览**：防抖实时预览，支持手动渲染
- **分享链接**：使用 LZ-string 压缩的 URL 分享
- **多图工作区**：管理多个图表，本地持久化
- **版本历史**：自动保存快照，支持恢复
- **AI 助手**：可选的 AI 代码分析与生成

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 打开 http://localhost:3000
```

## 常用命令

```bash
# 开发
npm run dev              # 启动开发服务器（端口 3000）

# 构建
npm run build            # 生产构建（包含 API 路由）
npm run build:static     # 静态导出（用于 GitHub Pages）

# 测试
npm run test             # 运行单元测试
npm run test:watch       # 监听模式
npm run test:smoke       # 冒烟测试（端点可用性）

# 代码质量
npm run lint             # ESLint 检查
npm run typecheck        # TypeScript 类型检查
npm run format           # Prettier 格式化
```

## 部署

### Docker

```bash
# 生产环境
docker compose --profile prod up --build -d

# 开发环境
docker compose --profile dev up --build

# 搭配自建 Kroki
docker compose --profile prod --profile kroki up -d
```

### GitHub Pages

静态导出模式用于 GitHub Pages 部署。该模式下远程渲染不可用。

### 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `KROKI_BASE_URL` | `https://kroki.io` | 远程渲染服务地址 |
| `PORT` | `3000` | 服务端口 |
| `NEXT_PUBLIC_GRAPHVIZ_WASM_BASE_URL` | CDN URL | Graphviz WASM 资源地址 |

## 架构

```
├── app/
│   ├── page.tsx              # 主页面组合
│   ├── api/
│   │   ├── render/route.ts   # Kroki 代理（带缓存）
│   │   └── healthz/route.ts  # 健康检查端点
├── components/               # React 组件
├── hooks/                    # 自定义 React Hooks
│   ├── useDiagramState.ts    # 工作区状态管理
│   ├── useDiagramRender.ts   # 渲染逻辑
│   └── useLivePreview.ts     # 防抖预览
├── lib/
│   ├── diagramConfig.ts      # 引擎/格式定义
│   ├── diagramSamples.ts     # 示例代码
│   └── exportUtils.ts        # 导出工具
```

## 文档

- [开发指南](docs/DEVELOPMENT.md) - 架构与开发说明
- [测试指南](docs/TESTING_GUIDE.md) - 测试策略
- [导出改进](docs/EXPORT_IMPROVEMENTS.md) - 导出能力说明
- [Kroki 自建](docs/kroki-self-hosting.md) - 自建 Kroki 方案

## 安全

- **本地渲染**：Mermaid 使用 `securityLevel: 'strict'`；Graphviz WASM 在浏览器中执行
- **远程渲染**：`/api/render` 转发到 Kroki，内存缓存
- **SVG 清洗**：DOMPurify 在渲染前清洗所有 SVG 内容
- **建议**：敏感内容使用本地渲染，或自建 Kroki

## 许可

MIT
