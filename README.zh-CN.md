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
</p>

<p align="center">
  <a href="README.md">English</a> | <b>简体中文</b>
</p>

<p align="center">
  <strong>在线体验：</strong> <a href="https://lessup.github.io/graph-viewer/">GitHub Pages 演示</a>
</p>

---

## 特性

- **16+ 引擎**：Mermaid、PlantUML、Graphviz、D2、Vega 等
- **混合渲染**：本地 WASM（快速）+ 远程 Kroki（广泛支持）
- **多格式导出**：SVG、PNG (2x/4x)、PDF、HTML、Markdown
- **即时分享**：LZ-string 压缩 URL
- **多图工作区**：本地持久化与版本历史
- **AI 助手**：可选的 AI 代码分析与生成

## 快速开始

```bash
# 克隆并安装
git clone https://github.com/LessUp/graph-viewer.git
cd graph-viewer
npm install

# 启动开发服务器
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)。

## 部署

### Docker（推荐）

```bash
docker compose --profile prod --profile kroki up -d
```

### GitHub Pages

```bash
npm run build:static
```

详见 [部署指南](docs/zh-CN/03-deployment/01-docker.md)。

## 支持的引擎

| 分类 | 引擎 |
|------|------|
| 常用 | Mermaid、PlantUML、Graphviz、D2 |
| 流程图 | Flowchart.js、BlockDiag、ActDiag |
| 时序与网络 | SeqDiag、NwDiag |
| 数据可视化 | Vega、Vega-Lite、WaveDrom |
| ASCII 艺术 | Ditaa、SVGBob、Nomnoml |
| 数据建模 | ERD (DBML)、Structurizr |

## 开发

```bash
npm run dev          # 开发服务器
npm run build        # 生产构建
npm run test         # 运行测试
npm run lint         # ESLint 检查
npm run typecheck    # TypeScript 检查
```

## 文档

- [English Documentation](docs/en/README.md)
- [中文文档](docs/zh-CN/README.md)
- [架构 RFC](specs/rfc/0001-core-architecture.md)
- [API 参考](docs/zh-CN/05-reference/02-api.md)

## 架构

```
用户输入 → 编辑器 → 预览引擎
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

## 安全性

- DOMPurify SVG 清洗
- Mermaid `securityLevel: 'strict'`
- 输入验证（100KB 限制）
- 请求超时（10秒）

## 贡献

参见 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 许可证

[MIT License](LICENSE)

## 致谢

- [Mermaid](https://mermaid.js.org/) - 图表工具
- [Kroki](https://kroki.io/) - 统一渲染 API
- [CodeMirror](https://codemirror.net/) - 代码编辑器
- [Next.js](https://nextjs.org/) - React 框架
