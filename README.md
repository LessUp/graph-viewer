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

## Overview

GraphViewer is a modern, all-in-one diagram visualization tool supporting **16+ diagram engines** with local and server-side hybrid rendering.

Built with **Next.js 15** + **React 19** + **TypeScript**, it provides a seamless experience for creating, previewing, and exporting diagrams.

## Features

- 🎨 **16+ Diagram Engines**: Mermaid, PlantUML, Graphviz, D2, and more
- ⚡ **Hybrid Rendering**: Local WASM for speed + Remote Kroki for broader support
- 💾 **Multiple Export Formats**: SVG, PNG (2x/4x), PDF, HTML, Markdown
- 🔗 **Share Links**: Compressed URL sharing with LZ-string encoding
- 🖥️ **Live Preview**: Debounced real-time preview with manual render option
- 📁 **Multi-diagram Workspace**: Manage multiple diagrams with local persistence
- 🕐 **Version History**: Auto-save snapshots with restore capability
- 🤖 **AI Assistant**: Optional AI-powered code analysis and generation

## Quick Start

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

## Deployment

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

See [Deployment Guide](docs/en/03-deployment/02-github-pages.md) for details.

### Self-Hosted Kroki

Deploy your own Kroki instance for complete privacy. See [Self-hosting Guide](docs/en/03-deployment/03-self-hosted.md).

## Development

```bash
npm run dev              # Development server
npm run build            # Production build
npm run build:static     # Static export
npm run test             # Run tests
npm run lint             # ESLint check
npm run typecheck        # TypeScript check
```

## Supported Engines

| Category | Engines |
|----------|---------|
| Popular | Mermaid, PlantUML, Graphviz, D2 |
| Flowcharts | Flowchart.js, BlockDiag, ActDiag |
| Sequence & Network | SeqDiag, NwDiag |
| Data Visualization | Vega, Vega-Lite, WaveDrom |
| ASCII Art | Ditaa, SVGBob, Nomnoml |
| Data Modeling | ERD |

## Specifications (Spec-Driven Development)

This project follows **Spec-Driven Development (SDD)**. All implementation details are defined in `/specs`:

- [Product Roadmap](specs/product/roadmap.md) — Development phases and planning
- [Product TODO](specs/product/todo.md) — Task backlog with priorities
- [Core Architecture RFC](specs/rfc/0001-core-architecture.md) — Technical architecture decisions
- [API Design RFC](specs/rfc/0002-api-design.md) — API design decisions
- [OpenAPI Specification](specs/api/openapi.yaml) — Machine-readable API definition
- [Database Schema](specs/db/schema-v1.dbml) — Data models and localStorage schema
- [Testing Specs](specs/testing/diagram-render.feature) — BDD test specifications

## Documentation

- [English Documentation](docs/en/README.md)
- [中文文档](docs/zh-CN/README.md)

## Architecture

```
app/
├── page.tsx                 # Main page composition
├── layout.tsx               # Root layout
├── globals.css              # Global styles
└── api/
    ├── render/route.ts      # Kroki proxy with cache
    └── healthz/route.ts     # Health check endpoint

components/                   # React components
hooks/                        # Custom React hooks
lib/                          # Utility modules
```

For detailed architecture, see [RFC-0001](specs/rfc/0001-core-architecture.md).

## Security

- **Local Rendering**: Mermaid uses `securityLevel: 'strict'`; Graphviz WASM runs in-browser
- **Remote Rendering**: `/api/render` forwards to Kroki with in-memory cache
- **SVG Sanitization**: DOMPurify sanitizes all SVG content before rendering
- **Input Validation**: Server validates engine, format, and code length

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.

## License

[MIT License](LICENSE)

---

<p align="center">
  Made with ❤️ by the GraphViewer Team
</p>
