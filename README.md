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
  <b>English</b> | <a href="README.zh-CN.md">简体中文</a>
</p>

---

## 🎯 Overview

GraphViewer is a modern, all-in-one diagram visualization tool supporting **16+ diagram engines** with local and server-side hybrid rendering.

Built with **Next.js 15** + **React 19** + **TypeScript**, it provides a seamless experience for creating, previewing, and exporting diagrams in various formats.

## ✨ Features

- 🎨 **16+ Diagram Engines**: Mermaid, PlantUML, Graphviz, D2, and more
- ⚡ **Hybrid Rendering**: Local WASM for speed + Remote Kroki for broader support
- 💾 **Multiple Export Formats**: SVG, PNG (2x/4x), PDF, HTML, Markdown
- 🔗 **Share Links**: Compressed URL sharing with LZ-string encoding
- 🖥️ **Live Preview**: Debounced real-time preview with manual render option
- 📁 **Multi-diagram Workspace**: Manage multiple diagrams with local persistence
- 🕐 **Version History**: Auto-save snapshots with restore capability
- 🤖 **AI Assistant**: Optional AI-powered code analysis and generation

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ and npm 10+

### Installation

```bash
# Clone repository
git clone https://github.com/LessUp/graph-viewer.git
cd graph-viewer

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📦 Installation & Deployment

### Docker (Recommended)

```bash
# Production with self-hosted Kroki
docker compose --profile prod --profile kroki up -d

# Development
docker compose --profile dev up
```

### GitHub Pages

Static export for GitHub Pages deployment. See [deployment guide](docs/en/03-deployment/02-github-pages.md) for details.

### Self-Hosted

Deploy your own Kroki instance for complete privacy. See [self-hosting guide](docs/en/03-deployment/03-self-hosted.md).

## 🛠️ Development

```bash
# Development server
npm run dev

# Build
npm run build              # Production build with API routes
npm run build:static       # Static export for GitHub Pages

# Testing
npm run test               # Run unit tests
npm run test:watch         # Watch mode
npm run test:smoke         # Smoke test (endpoint availability)

# Code Quality
npm run lint               # ESLint check
npm run typecheck          # TypeScript type check
npm run format             # Prettier format
```

## 📚 Documentation

### 📖 Specifications

This project follows **Spec-Driven Development (SDD)**. All implementation details are defined in `/specs`:

- [Product Roadmap](specs/product/roadmap.md) — Development phases and planning
- [Product TODO](specs/product/todo.md) — Task backlog with priorities
- [Core Architecture RFC](specs/rfc/0001-core-architecture.md) — Technical architecture decisions
- [API Design RFC](specs/rfc/0002-api-design.md) — API design decisions
- [OpenAPI Specification](specs/api/openapi.yaml) — Machine-readable API definition
- [Database Schema](specs/db/schema-v1.dbml) — Data models and localStorage schema
- [Testing Specs](specs/testing/diagram-render.feature) — BDD test specifications

### 📖 English Documentation

- [Documentation Center](docs/en/README.md)
- [Quick Start](docs/en/01-getting-started/01-quick-start.md)
- [Architecture Overview](docs/en/01-getting-started/03-architecture.md)
- [Development Guide](docs/en/02-development/)
- [Deployment Guide](docs/en/03-deployment/)
- [Features](docs/en/04-features/)

### 📖 中文文档

- [文档中心](docs/zh-CN/README.md)
- [快速开始](docs/zh-CN/01-getting-started/01-quick-start.md)
- [架构概览](docs/zh-CN/01-getting-started/03-architecture.md)
- [开发指南](docs/zh-CN/02-development/)
- [部署指南](docs/zh-CN/03-deployment/)
- [功能特性](docs/zh-CN/04-features/)

## 🏗️ Architecture

```
app/
├── page.tsx                 # Main page composition
├── layout.tsx               # Root layout
├── globals.css              # Global styles
└── api/
    ├── render/route.ts      # Kroki proxy with cache
    └── healthz/route.ts     # Health check endpoint

components/                   # React components
├── EditorPanel.tsx          # Code editor and controls
├── PreviewPanel.tsx         # Diagram preview
├── PreviewToolbar.tsx       # Export and zoom controls
└── ...

hooks/                        # Custom React hooks
├── useDiagramState.ts       # State management
├── useDiagramRender.ts      # Rendering logic
└── ...

lib/                          # Utility modules
├── diagramConfig.ts         # Engine/format definitions
├── diagramSamples.ts        # Sample code snippets
└── exportUtils.ts           # Export implementations
```

## 🔧 Supported Engines

| Category | Engines |
|----------|---------|
| Popular | Mermaid, PlantUML, Graphviz, D2 |
| Flowcharts | Flowchart.js, BlockDiag, ActDiag |
| Sequence & Network | SeqDiag, NwDiag |
| Data Visualization | Vega, Vega-Lite, WaveDrom |
| ASCII Art | Ditaa, SVGBob, Nomnoml |
| Data Modeling | ERD |

## 🛡️ Security

- **Local Rendering**: Mermaid uses `securityLevel: 'strict'`; Graphviz WASM runs in-browser
- **Remote Rendering**: `/api/render` forwards to Kroki with in-memory cache
- **SVG Sanitization**: DOMPurify sanitizes all SVG content before rendering
- **Input Validation**: Server validates engine, format, and code length

**Recommendation**: Use local rendering for sensitive content, or self-host Kroki.

## 🤝 Contributing

Contributions are welcome! Please read our [Development Guidelines](docs/en/02-development/02-guidelines.md) before submitting pull requests.

## 📄 License

GraphViewer is released under the [MIT License](LICENSE).

---

<p align="center">
  Made with ❤️ by the GraphViewer Team
</p>
