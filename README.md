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
</p>

<p align="center">
  <b>English</b> | <a href="README.zh-CN.md">简体中文</a>
</p>

<p align="center">
  <strong>Try it live:</strong> <a href="https://lessup.github.io/graph-viewer/">GitHub Pages Demo</a>
</p>

---

## Features

- **16+ Engines**: Mermaid, PlantUML, Graphviz, D2, Vega, and more
- **Hybrid Rendering**: Local WASM (fast) + Remote Kroki (broad support)
- **Multiple Exports**: SVG, PNG (2x/4x), PDF, HTML, Markdown
- **Instant Sharing**: LZ-string compressed URLs
- **Multi-Diagram Workspace**: Local persistence with version history
- **AI Assistant**: Optional AI-powered code analysis and generation

## Quick Start

```bash
# Clone and install
git clone https://github.com/LessUp/graph-viewer.git
cd graph-viewer
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment

### Docker (Recommended)

```bash
docker compose --profile prod --profile kroki up -d
```

### GitHub Pages

```bash
npm run build:static
```

See [Deployment Guide](docs/en/03-deployment/01-docker.md) for details.

## Supported Engines

| Category | Engines |
|----------|---------|
| Popular | Mermaid, PlantUML, Graphviz, D2 |
| Flowcharts | Flowchart.js, BlockDiag, ActDiag |
| Sequence & Network | SeqDiag, NwDiag |
| Data Visualization | Vega, Vega-Lite, WaveDrom |
| ASCII Art | Ditaa, SVGBob, Nomnoml |
| Data Modeling | ERD (DBML), Structurizr |

## Development

```bash
npm run dev          # Development server
npm run build        # Production build
npm run test         # Run tests
npm run lint         # ESLint check
npm run typecheck    # TypeScript check
```

## Documentation

- [English Documentation](docs/en/README.md)
- [中文文档](docs/zh-CN/README.md)
- [Architecture RFC](specs/rfc/0001-core-architecture.md)
- [API Reference](docs/en/05-reference/02-api.md)

## Architecture

```
User Input → Editor → Preview Engine
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

## Security

- SVG sanitization with DOMPurify
- Mermaid `securityLevel: 'strict'`
- Input validation (100KB limit)
- Request timeout (10s)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT License](LICENSE)

## Acknowledgments

- [Mermaid](https://mermaid.js.org/) - Diagramming tool
- [Kroki](https://kroki.io/) - Unified rendering API
- [CodeMirror](https://codemirror.net/) - Code editor
- [Next.js](https://nextjs.org/) - React framework
