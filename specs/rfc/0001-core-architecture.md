# RFC-0001: Core Architecture

**Status**: Accepted
**Created**: 2026-04-17
**Author**: GraphViewer Team

## Context

GraphViewer is a Next.js 15 + React 19 application for visualizing 16+ diagram engines with hybrid rendering (local WASM + remote Kroki). This RFC documents the core architecture decisions.

## Decision: Two Deployment Modes

We support two deployment modes to balance feature completeness and deployment simplicity:

### Full Server Mode

- Standard Next.js build with API routes
- Includes `/api/render` Kroki proxy with in-memory cache
- Suitable for self-hosted or Docker deployment
- Build command: `npm run build`

### Static Export Mode

- Static export without API routes
- All rendering done client-side via WASM
- Path prefix `/graph-viewer` for GitHub Pages
- Suitable for static hosting (GitHub Pages, Netlify, etc.)
- Build command: `npm run build:static` with `GITHUB_PAGES=true`

## Data Flow Architecture

```
useDiagramState (state + LocalStorage + URL share)
    ↓
page.tsx (top-level composition)
    ├── EditorPanel / CodeEditor  ← code input
    ├── PreviewPanel              ← renders output
    ├── DiagramList               ← diagram list sidebar
    └── SidebarTabs               ← Editor / AI / VersionHistory tabs

useLivePreview (debounced) → useDiagramRender → local render (Mermaid/Graphviz WASM)
                                              └→ POST /api/render (Kroki proxy, TTL 120s cache)
```

## Layer Responsibilities

| Layer | Files | Purpose |
|-------|-------|---------|
| State | `hooks/useDiagramState.ts`, `hooks/useSettings.ts`, `hooks/useToast.ts` | App state, persistence, URL encoding |
| Render | `hooks/useDiagramRender.ts`, `hooks/useLivePreview.ts` | Local + remote rendering, debouncing |
| Actions | `hooks/useVersionActions.ts`, `hooks/useWorkspaceActions.ts`, `hooks/useAIActions.ts` | Encapsulated user action handlers |
| Config | `lib/diagramConfig.ts`, `lib/types.ts` | Engine/format definitions, `DiagramDoc` type |

## Core Constraints

1. **Engine/Format values** must come from `lib/diagramConfig.ts` — no magic strings in business code.
2. **`DiagramDoc` structure** is `{ id, name, engine, format, code, updatedAt }` — maintain compatibility.
3. When adding/changing a diagram engine or export format, sync all affected files (see Engine/Format Change Checklist).

## Engine/Format Change Checklist

When modifying diagram engines, formats, or export capabilities, check all of:
- `lib/diagramConfig.ts` — type definitions, `ENGINE_CATEGORIES`, `getKrokiType`
- `lib/diagramSamples.ts` — sample code
- `lib/syntaxHighlight.ts` — CodeMirror language mapping
- `lib/exportUtils.ts` — export format mapping
- `hooks/useDiagramRender.ts` — local/remote render logic
- `app/api/render/route.ts` — Kroki proxy, engine whitelist
- `components/EditorPanel.tsx` — engine/format selector UI
- `components/PreviewPanel.tsx` — preview rendering
- `components/PreviewToolbar.tsx` — export entry points
- `app/page.tsx` — top-level composition

## Supported Engines

| Category | Engines |
|----------|---------|
| Popular | Mermaid, PlantUML, Graphviz, D2 |
| Flowcharts | Flowchart.js, BlockDiag, ActDiag |
| Sequence & Network | SeqDiag, NwDiag |
| Data Visualization | Vega, Vega-Lite, WaveDrom |
| ASCII Art | Ditaa, SVGBob, Nomnoml |
| Data Modeling | ERD |

## Security Considerations

- **Local Rendering**: Mermaid uses `securityLevel: 'strict'`; Graphviz WASM runs in-browser
- **Remote Rendering**: `/api/render` forwards to Kroki with in-memory cache
- **SVG Sanitization**: DOMPurify sanitizes all SVG content before rendering
- **Input Validation**: Server validates engine, format, and code length

## Alternatives Considered

1. **Pure client-side rendering**: Rejected due to limited engine support in WASM
2. **Pure server-side rendering**: Rejected due to privacy concerns for sensitive diagrams
3. **Redux/Zustand for state**: Rejected in favor of React hooks + localStorage for simplicity

## References

- [API Design RFC](0002-api-design.md) — API endpoint specifications
- [OpenAPI Specification](../api/openapi.yaml) — Machine-readable API definition
- [Database Schema](../db/schema-v1.dbml) — Data model definitions
- [Testing Specs](../testing/diagram-render.feature) — Test requirements
