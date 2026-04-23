# Product Roadmap

> This document describes the development roadmap for GraphViewer.

## Project Vision

Create an "out-of-the-box, lightweight but not crude" one-stop diagram visualization tool supporting Mermaid, PlantUML, Graphviz, and other mainstream grammars — suitable for individuals and small teams for daily documentation and architecture design.

**Core Features**:

- Local + remote hybrid rendering, balancing performance and security
- Containerized deployment with one-click scripts
- Basic testing and benchmarking capabilities

## Target Users

- **Individual developers / technical writers**: Writing technical blogs, documentation, architecture diagrams
- **Internal team document maintainers**: Embedding generated content in Wiki / Confluence / Notion
- **Open source users**: Looking for a simple, easy-to-deploy diagram visualization tool

## Completed Phases

### Phase 1: Editor & Preview Experience ✅ Complete

- [x] CodeMirror editor integration
- [x] Syntax highlighting (Mermaid / PlantUML / Graphviz)
- [x] Keyboard shortcuts (Ctrl+Enter to render, Ctrl+S to export)
- [x] SVG preview zoom and pan
- [x] Live preview with debouncing
- [x] Compressed share links

### Phase 2: Stability & Engineering ✅ Complete

- [x] Vitest unit testing framework
- [x] ESLint + Prettier code standards
- [x] GitHub Actions CI/CD
- [x] Docker multi-environment deployment
- [x] Smoke tests

### Phase 3: Advanced Features ✅ Complete

- [x] Multi-diagram workspace
- [x] Version history
- [x] Multi-format export (SVG/PNG/PDF/HTML/MD)
- [x] Template library entry point
- [ ] Short-link sharing

### Phase 4: Operations & Security 📋 Planned

- [ ] Structured logging
- [ ] Error tracking integration
- [ ] Monitoring and alerting

## Future Planning

### Short-term (1-2 weeks)

1. Improve "create from template" entry point
2. Optimize large diagram rendering performance

### Mid-term (1-2 months)

1. Short-link sharing feature
2. Structured logging

### Long-term

1. Collaboration features
2. Custom themes
3. Plugin system

## Using This Roadmap

- Before each iteration, select a small batch of tasks from the backlog, scoped to 1-2 weeks
- Update this document with dates and reasons if adjustments are made during development
