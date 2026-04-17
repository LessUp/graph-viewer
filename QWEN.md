# QWEN.md — GraphViewer Project Context

> This file provides instructional context for Qwen Code when working with this repository.

## Project Overview

**GraphViewer** is a modern diagram visualization tool supporting **16+ diagram engines** with hybrid rendering (local WASM + remote Kroki proxy). Built with **Next.js 15** + **React 19** + **TypeScript**, it provides a seamless single-page application (SPA) experience for creating, previewing, and exporting diagrams.

### Key Technologies

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 15 (App Router) |
| **UI** | React 19, TypeScript |
| **Styling** | Tailwind CSS |
| **Code Editor** | CodeMirror 6 |
| **Diagram Engines** | Mermaid, PlantUML, Graphviz, D2, and 12+ more |
| **Rendering** | Local WASM (Mermaid, Graphviz) + Remote Kroki |
| **Testing** | Vitest, Testing Library |
| **Linting** | ESLint, Prettier |

### Core Features

- 🎨 16+ diagram engines (Mermaid, PlantUML, Graphviz, D2, etc.)
- ⚡ Hybrid rendering: Local WASM for speed + Remote Kroki for broader support
- 💾 Multiple export formats: SVG, PNG (2x/4x), PDF, HTML, Markdown
- 🔗 LZ-string compressed URL sharing
- 🖥️ Live preview with debounced real-time updates
- 📁 Multi-diagram workspace with localStorage persistence
- 🕐 Version history with auto-save snapshots
- 🤖 AI-powered code analysis, generation, and fixing

## Development Philosophy: Spec-Driven Development (SDD)

This project strictly follows **Spec-Driven Development (SDD)**. The `/specs` directory is the **Single Source of Truth** for all implementation decisions.

**Core Rule**: Before coding, read relevant specs. For new features, update specs first. Code must 100% comply with specs.

### Spec Directory Structure

| Directory | Purpose |
|-----------|---------|
| `/specs/product/` | Product features, roadmap, TODO |
| `/specs/rfc/` | Technical design documents and architecture decisions |
| `/specs/api/` | API interface definitions (OpenAPI) |
| `/specs/db/` | Database schema definitions |
| `/specs/testing/` | BDD test specifications |

## Project Structure

```
graph-viewer/
├── app/                          # Next.js App Router
│   ├── page.tsx                  #   Main SPA (single page)
│   ├── layout.tsx                #   Root layout
│   ├── globals.css               #   Global styles
│   └── api/                      #   API routes
│       ├── render/route.ts       #     Kroki proxy with cache
│       └── healthz/route.ts      #     Health check
│
├── components/                   # UI Components (organized by domain)
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
├── lib/                          # Utility Libraries & Types
├── specs/                        # SDD Specifications (Single Source of Truth)
├── docs/                         # User Documentation (bilingual: en / zh-CN)
├── scripts/                      # Build & automation scripts (ESM .mjs)
└── public/                       # Static assets (favicon)
```

## Commands

### Development

```bash
npm run dev              # Start dev server on port 3000
npm run build            # Standard build (with API routes)
npm run build:static     # Static export for GitHub Pages
npm run build:optimized  # Optimized build script
npm run start            # Production server
npm run analyze          # Bundle analysis
```

### Testing

```bash
npm run test             # Run unit tests (vitest)
npm run test:watch       # Watch mode
npm run test:smoke       # Smoke test (endpoint availability)
npm run bench            # Performance benchmarks
```

To run a single test file: `npx vitest run path/to/file.test.ts`

### Code Quality

```bash
npm run lint             # ESLint check
npm run lint:fix         # Auto-fix ESLint issues
npm run format           # Prettier format
npm run format:check     # Prettier check
npm run typecheck        # TypeScript type check (tsc --noEmit)
```

### Docker

```bash
docker compose --profile prod --profile kroki up -d   # Production + Kroki
docker compose --profile dev up                        # Development
```

## Coding Conventions

### TypeScript

- **Strict mode enabled**: `noUncheckedIndexedAccess`, `noImplicitReturns`, `noFallthroughCasesInSwitch`
- **Path alias**: `@/*` maps to project root
- **Module resolution**: `Bundler` mode
- **Target**: ES2021

### React Conventions

- **`'use client'`**: Use only when necessary (hooks, event handlers, browser APIs)
- **Pure logic**: Files in `lib/` should NOT have `'use client'`
- **Components**: Organized by domain in subdirectories (layout/, editor/, preview/, etc.)
- **Hooks**: Separated into state hooks and action hooks

### Error Handling

```typescript
// Correct
catch (e: unknown) {
  if (e instanceof Error) {
    console.error(e.message);
  }
}

// Wrong
catch (e: any) {
  console.error(e.message);
}
```

### Code Organization Rules

- **Small incremental changes**: Prefer modifying existing components over creating new ones
- **Hook consumers**: When modifying a hook's return type, check all consumers (`page.tsx` is primary)
- **File changes**: When deleting/renaming/moving files, update:
  - Tests
  - README (both English and Chinese)
  - Specs in `/specs/`
  - References in other files

### UI Text

- Use **Chinese** in the user interface (consistent with existing interface)
- Documentation is bilingual: English (`docs/en/`) and Chinese (`docs/zh-CN/`)

## Architecture

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

### Key Types

```typescript
type Engine = 'mermaid' | 'plantuml' | 'graphviz' | 'd2' | ...; // 16+ engines
type Format = 'svg' | 'png' | 'pdf';

type DiagramDoc = {
  id: string;
  name: string;
  engine: Engine;
  format: Format;
  code: string;
  updatedAt: string;
};
```

Engine and format values must come from `lib/diagramConfig.ts` — no magic strings in business code.

### API Routes

| Endpoint | Description |
|----------|-------------|
| `POST /api/render` | Kroki proxy with in-memory cache (TTL 120s), 100KB limit, 10s timeout, base URL allowlist |
| `GET /api/healthz` | Health check with Kroki connectivity verification |

For full API specification, see [specs/api/openapi.yaml](specs/api/openapi.yaml).

### Engine/Format Change Checklist

When modifying diagram engines, formats, or export capabilities, sync all affected files:

1. `lib/diagramConfig.ts` — type definitions, `ENGINE_CATEGORIES`, `getKrokiType`
2. `lib/diagramSamples.ts` — sample code
3. `lib/syntaxHighlight.ts` — CodeMirror language mapping
4. `lib/exportUtils.ts` — export format mapping
5. `hooks/useDiagramRender.ts` — local/remote render logic
6. `app/api/render/route.ts` — Kroki proxy, engine whitelist
7. `components/editor/EditorPanel.tsx` — engine/format selector UI
8. `components/preview/PreviewPanel.tsx` — preview rendering
9. `components/preview/PreviewToolbar.tsx` — export entry points
10. `app/page.tsx` — top-level composition

## Security

| Layer | Implementation |
|-------|----------------|
| **Local Rendering** | Mermaid `securityLevel: 'strict'`; Graphviz WASM in-browser isolation |
| **Remote Rendering** | `/api/render` proxies to Kroki with in-memory cache (TTL 120s) |
| **SVG Sanitization** | DOMPurify sanitizes all SVG content before rendering |
| **Input Validation** | Server validates engine, format, and code length (100KB limit) |
| **Request Security** | Base URL allowlist, 10s timeout, request deduplication |

## Deployment

### GitHub Pages

- Uses `npm run build:static` to generate static export in `./out`
- `basePath: '/graph-viewer'` for repository-name-based path
- `images.unoptimized: true` (required for static export)
- Automated via `.github/workflows/pages.yml` with Lighthouse CI and link checks

### Docker

- Production: `docker compose --profile prod --profile kroki up -d`
- Standalone server with self-hosted Kroki option

### Netlify

- Configured via `netlify.toml` with `@netlify/plugin-nextjs`

## Related Documents

- [AGENTS.md](AGENTS.md) — AI agent workflow specification (SDD)
- [CLAUDE.md](CLAUDE.md) — Claude Code specific instructions and coding conventions
- [CONTRIBUTING.md](CONTRIBUTING.md) — Contribution guide for human contributors
- [README.md](README.md) — Project overview and quick start
- [CHANGELOG.md](CHANGELOG.md) — Change history
