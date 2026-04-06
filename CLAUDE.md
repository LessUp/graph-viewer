# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev              # Start dev server on port 3000
npm run build            # Standard build (with API routes)
npm run build:static     # Static export build for GitHub Pages
npm run start            # Production server

# Testing
npm run test             # Run unit tests (vitest)
npm run test:watch       # Watch mode
npm run test:smoke       # Smoke test (endpoint availability)
npm run bench            # Performance benchmarks

# Code Quality
npm run lint             # ESLint check
npm run lint:fix         # Auto-fix ESLint issues
npm run format           # Prettier format
npm run typecheck        # TypeScript type check (tsc --noEmit)
```

To run a single test file: `npx vitest run path/to/file.test.ts`

## Architecture Overview

**GraphViewer** is a Next.js 15 + React 19 app for visualizing 16 diagram types (Mermaid, PlantUML, Graphviz, D2, Nomnoml, etc.) with two deployment modes:
- **Full server mode**: `npm run build` — includes `/api/render` Kroki proxy with in-memory cache
- **Static export mode**: `npm run build:static` — for GitHub Pages (`GITHUB_PAGES=true`), path prefix `/graph-viewer`

### Data Flow

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

### Layer Responsibilities

| Layer | Files | Purpose |
|-------|-------|---------|
| State | `hooks/useDiagramState.ts`, `hooks/useSettings.ts`, `hooks/useToast.ts` | App state, persistence, URL encoding |
| Render | `hooks/useDiagramRender.ts`, `hooks/useLivePreview.ts` | Local + remote rendering, debouncing |
| Actions | `hooks/useVersionActions.ts`, `hooks/useWorkspaceActions.ts`, `hooks/useAIActions.ts` | Encapsulated user action handlers |
| Config | `lib/diagramConfig.ts`, `lib/types.ts` | Engine/format definitions, `DiagramDoc` type |

### Core Constraints

- **Engine/Format values** must come from `lib/diagramConfig.ts` — no magic strings in business code.
- **`DiagramDoc` structure** is `{ id, name, engine, format, code, updatedAt }` — maintain compatibility.
- When adding/changing a diagram engine or export format, sync all affected files (see below).

### Engine/Format Change Checklist

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

### Preview/Export Pipeline

- SVG preview depends on `sanitizedSvg`
- PNG/PDF preview depends on `base64` + `contentType`
- `PreviewToolbar` only receives exportable SVG content
- Export mappings defined in `lib/exportUtils.ts`

### API Routes

- `POST /api/render` — Kroki proxy, in-memory cache (TTL 120s), 100KB code size limit, 10s timeout
- `GET /api/healthz` — health check for Docker/Netlify

## Coding Conventions

- UI text should be in Chinese (consistent with existing interface).
- `'use client'` only when using hooks, event handlers, or browser APIs (`window`, `document`, `localStorage`). Pure logic in `lib/` should not have it.
- Error handling: use `catch (e: unknown)` + `instanceof Error` narrowing, not `catch (e: any)`.
- Prefer small incremental changes to existing components over creating new top-level pages or global state layers.
- When deleting/renaming/moving files, update tests, README, ROADMAP, TODO, and `.windsurf` references.
- When modifying a hook's return type, check all consumers (`page.tsx` is the primary consumer).

## Changelog Requirement

Every change must have a changelog entry:
- File path: `changelog/YYYY-MM-DD-<short-slug>.md`
- After adding a changelog file, update the summary entry in the root `CHANGELOG.md`.
