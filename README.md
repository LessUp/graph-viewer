# GraphViewer

[![CI](https://github.com/LessUp/graph-viewer/actions/workflows/ci.yml/badge.svg)](https://github.com/LessUp/graph-viewer/actions/workflows/ci.yml)
[![Deploy](https://github.com/LessUp/graph-viewer/actions/workflows/pages.yml/badge.svg)](https://github.com/LessUp/graph-viewer/actions/workflows/pages.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

English | [简体中文](README.zh-CN.md)

A modern, all-in-one diagram visualization tool supporting **16 diagram engines** with local and server-side hybrid rendering.

## Supported Engines

| Category | Engines |
|----------|---------|
| Popular | Mermaid, PlantUML, Graphviz (DOT), D2 |
| Flowcharts | Flowchart.js, BlockDiag, ActDiag |
| Sequence & Network | SeqDiag, NwDiag |
| Data Visualization | Vega, Vega-Lite, WaveDrom |
| ASCII Art | Ditaa, SVGBob, Nomnoml |
| Data Modeling | ERD |

## Features

- **Hybrid Rendering**: Local Mermaid/Graphviz WASM rendering for speed + remote Kroki for broader format support
- **Multiple Export Formats**: SVG, PNG (2x/4x), PDF, HTML, Markdown, source code
- **Real-time Preview**: Debounced live preview with manual render option
- **Share Links**: Compressed URL sharing with LZ-string encoding
- **Multi-diagram Workspace**: Manage multiple diagrams with local persistence
- **Version History**: Auto-save snapshots with restore capability
- **AI Assistant**: Optional AI-powered code analysis and generation

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

## Commands

```bash
# Development
npm run dev              # Start dev server on port 3000

# Build
npm run build            # Production build (with API routes)
npm run build:static     # Static export for GitHub Pages

# Testing
npm run test             # Run unit tests
npm run test:watch       # Watch mode
npm run test:smoke       # Smoke test (endpoint availability)

# Code Quality
npm run lint             # ESLint check
npm run typecheck        # TypeScript type check
npm run format           # Prettier format
```

## Deployment

### Docker

```bash
# Production
docker compose --profile prod up --build -d

# Development
docker compose --profile dev up --build

# With self-hosted Kroki
docker compose --profile prod --profile kroki up -d
```

### GitHub Pages

Static export mode is used for GitHub Pages deployment. Remote rendering is unavailable in this mode.

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `KROKI_BASE_URL` | `https://kroki.io` | Remote rendering service URL |
| `PORT` | `3000` | Server port |
| `NEXT_PUBLIC_GRAPHVIZ_WASM_BASE_URL` | CDN URL | Graphviz WASM resources |

## Architecture

```
├── app/
│   ├── page.tsx              # Main page composition
│   ├── api/
│   │   ├── render/route.ts   # Kroki proxy with cache
│   │   └── healthz/route.ts  # Health check endpoint
├── components/               # React components
├── hooks/                    # Custom React hooks
│   ├── useDiagramState.ts    # Workspace state management
│   ├── useDiagramRender.ts   # Rendering logic
│   └── useLivePreview.ts     # Debounced preview
├── lib/
│   ├── diagramConfig.ts      # Engine/format definitions
│   ├── diagramSamples.ts     # Sample code
│   └── exportUtils.ts        # Export utilities
```

## Documentation

- [Development Guide](docs/DEVELOPMENT.md) - Architecture and development guide
- [Testing Guide](docs/TESTING_GUIDE.md) - Testing strategies
- [Export Improvements](docs/EXPORT_IMPROVEMENTS.md) - Export capabilities
- [Kroki Self-hosting](docs/kroki-self-hosting.md) - Self-hosted Kroki setup

## Security

- **Local Rendering**: Mermaid uses `securityLevel: 'strict'`; Graphviz WASM runs in-browser
- **Remote Rendering**: `/api/render` forwards to Kroki with in-memory cache
- **SVG Sanitization**: DOMPurify sanitizes all SVG content before rendering
- **Recommendation**: Use local rendering for sensitive content, or self-host Kroki

## License

MIT
