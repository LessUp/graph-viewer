# GraphViewer

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue.svg" alt="Version">
  <a href="https://github.com/LessUp/graph-viewer/blob/master/LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License: MIT">
  </a>
  <a href="https://github.com/LessUp/graph-viewer/actions/workflows/ci.yml">
    <img src="https://github.com/LessUp/graph-viewer/actions/workflows/ci.yml/badge.svg" alt="CI">
  </a>
  <a href="https://github.com/LessUp/graph-viewer/actions/workflows/pages.yml">
    <img src="https://github.com/LessUp/graph-viewer/actions/workflows/pages.yml/badge.svg" alt="Deploy">
  </a>
  <img src="https://img.shields.io/badge/Next.js-15-black.svg" alt="Next.js 15">
  <img src="https://img.shields.io/badge/React-19-61DAFB.svg" alt="React 19">
  <img src="https://img.shields.io/badge/Node.js-22+-339933.svg" alt="Node: 22+">
</p>

<p align="center">
  <b>English</b> | <a href="README.zh-CN.md">简体中文</a>
</p>

<p align="center">
  <strong>🚀 Try it live:</strong> <a href="https://lessup.github.io/graph-viewer/">GitHub Pages Demo</a>
</p>

---

<p align="center">
  <b>Modern diagram visualization tool with 16+ engines, hybrid rendering, and AI-powered assistance</b>
</p>

<p align="center">
  Create, preview, and share diagrams instantly with a seamless workspace experience
</p>

---

## ✨ Key Features

| Category | Features |
|----------|----------|
| **🎨 Multiple Engines** | Mermaid, PlantUML, Graphviz, D2, and 12+ more engines |
| **⚡ Hybrid Rendering** | Local WASM for speed + Remote Kroki for broader support |
| **💾 Export Options** | SVG, PNG (2x/4x), PDF, HTML, Markdown |
| **🔗 Instant Sharing** | LZ-string compressed URLs for easy sharing |
| **🖥️ Live Preview** | Real-time debounced preview with manual render option |
| **📁 Multi-Diagram Workspace** | Manage multiple diagrams with local persistence |
| **🕐 Version History** | Auto-save snapshots with one-click restore |
| **🤖 AI Assistant** | AI-powered code analysis, generation, and fixing |
| **🛡️ Security First** | DOMPurify SVG sanitization, strict mode, input validation |

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

## 📦 Deployment

### Docker (Recommended)

```bash
# Production with self-hosted Kroki
docker compose --profile prod --profile kroki up -d

# Development
docker compose --profile dev up
```

### GitHub Pages

```bash
npm run build:static
```

See [Deployment Guide](docs/en/03-deployment/02-github-pages.md) for complete instructions.

### Self-Hosted Kroki

Deploy your own Kroki instance for complete privacy. See [Self-hosting Guide](docs/en/03-deployment/03-self-hosted.md).

## 🎯 Supported Diagram Engines

| Category | Engines |
|----------|---------|
| **Popular** | Mermaid, PlantUML, Graphviz, D2 |
| **Flowcharts** | Flowchart.js, BlockDiag, ActDiag |
| **Sequence & Network** | SeqDiag, NwDiag |
| **Data Visualization** | Vega, Vega-Lite, WaveDrom |
| **ASCII Art** | Ditaa, SVGBob, Nomnoml |
| **Data Modeling** | ERD (DBML), Structurizr |
| **Advanced** | C4PlantUML, TikZ, Bytefield, Railroad, Picosat |

## 🛠️ Development

### Essential Commands

```bash
npm run dev              # Development server on port 3000
npm run build            # Production build (with API routes)
npm run build:static     # Static export for GitHub Pages
npm run start            # Production server

# Code Quality
npm run test             # Run unit tests (vitest)
npm run test:watch       # Watch mode
npm run test:smoke       # Smoke test (endpoint availability)
npm run lint             # ESLint check
npm run lint:fix         # Auto-fix ESLint issues
npm run typecheck        # TypeScript type check
npm run bench            # Performance benchmarks
```

### Project Structure

```
graph-viewer/
├── app/                          # Next.js App Router
│   ├── page.tsx                  #   Main SPA
│   ├── layout.tsx                #   Root layout
│   ├── globals.css               #   Global styles
│   └── api/                      #   API routes
│       ├── render/route.ts       #     Kroki proxy with cache
│       └── healthz/route.ts      #     Health check
│
├── components/                   # UI Components (by domain)
│   ├── layout/                   #   AppHeader, Sidebar, ErrorBoundary
│   ├── editor/                   #   CodeEditor, EditorPanel
│   ├── preview/                  #   PreviewPanel, PreviewToolbar
│   ├── sidebar/                  #   DiagramList, SidebarTabs
│   ├── dialogs/                  #   Dialogs, SettingsModal
│   ├── feedback/                 #   Toast
│   ├── ai/                       #   AIAssistantPanel
│   └── version/                  #   VersionHistoryPanel
│
├── hooks/                        # Custom React Hooks (10 hooks)
├── lib/                          # Utility Libraries
├── specs/                        # Spec-Driven Development (Single Source of Truth)
│   ├── product/                  #   Roadmap, TODO
│   ├── rfc/                      #   Architecture decisions
│   ├── api/                      #   OpenAPI specification
│   ├── db/                       #   Database schema
│   └── testing/                  #   BDD test specs
│
├── docs/                         # User Documentation (bilingual)
│   ├── en/                       #   English
│   └── zh-CN/                    #   Chinese
│
└── scripts/                      # Build & automation (ESM .mjs)
```

For detailed architecture, see [RFC-0001: Core Architecture](specs/rfc/0001-core-architecture.md).

## 📚 Documentation

Complete documentation is available in both English and Chinese:

- [English Documentation](docs/en/README.md)
- [中文文档](docs/zh-CN/README.md)

### Documentation Sections

| Section | Topics |
|---------|--------|
| **Getting Started** | Quick Start, Installation, Architecture Overview |
| **Development** | Setup, Guidelines, Testing |
| **Deployment** | Docker, GitHub Pages, Self-Hosted Kroki |
| **Features** | Export, Rendering, AI Assistant |
| **Reference** | Configuration, API Reference |

## 🏗️ Architecture

### Hybrid Rendering Strategy

```
User Input → Code Editor → Preview Engine
                   ↓
        ┌──────────┴──────────┐
        ↓                     ↓
  Local WASM             Remote Kroki
  (Mermaid,              (All other
   Graphviz)              engines)
        ↓                     ↓
        └──────────┬──────────┘
                   ↓
              SVG/PNG/PDF Output
```

### Spec-Driven Development

This project follows **Spec-Driven Development (SDD)**. All implementation details are defined in `/specs`:

- [Product Roadmap](specs/product/roadmap.md) — Development phases and planning
- [Product TODO](specs/product/todo.md) — Task backlog with priorities
- [Core Architecture RFC](specs/rfc/0001-core-architecture.md) — Technical architecture decisions
- [API Design RFC](specs/rfc/0002-api-design.md) — API design decisions
- [OpenAPI Specification](specs/api/openapi.yaml) — Machine-readable API definition
- [Database Schema](specs/db/schema-v1.dbml) — Data models and localStorage schema
- [Testing Specs](specs/testing/diagram-render.feature) — BDD test specifications

## 🔒 Security

| Layer | Implementation |
|-------|----------------|
| **Local Rendering** | Mermaid `securityLevel: 'strict'`; Graphviz WASM in-browser isolation |
| **Remote Rendering** | `/api/render` proxies to Kroki with in-memory cache (TTL 120s) |
| **SVG Sanitization** | DOMPurify sanitizes all SVG content before rendering |
| **Input Validation** | Server validates engine, format, and code length (100KB limit) |
| **Request Security** | Base URL allowlist, 10s timeout, request deduplication |

## 📈 Recent Changes

See [CHANGELOG.md](CHANGELOG.md) for complete history.

| Date | Change |
|------|--------|
| 2026-04-17 | Directory structure optimization and workflow improvements |
| 2026-04-17 | Security fixes and custom dialog implementation |
| 2026-04-16 | Dependency cleanup and Node.js 22 upgrade |
| 2026-04-06 | Release hardening and documentation completion |
| 2026-03-10 | Workflow deep standardization |

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for development guidelines.

### How to Contribute

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

## 📄 License

Distributed under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- [Mermaid](https://mermaid.js.org/) - Diagramming and charting tool
- [Kroki](https://kroki.io/) - Unified diagram rendering API
- [CodeMirror](https://codemirror.net/) - In-browser code editor
- [Next.js](https://nextjs.org/) - React framework

---

<p align="center">
  Made with ❤️ by the GraphViewer Team
</p>
