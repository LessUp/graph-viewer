# CLAUDE.md

> This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.
> For AI agent workflow, see [AGENTS.md](AGENTS.md).

## Project Philosophy: Spec-Driven Development (SDD)

This project follows the **Spec-Driven Development (SDD)** paradigm. All code implementations must use the `/specs` directory as the Single Source of Truth.

**Core Principle**: Before coding, read specs. For new features, update specs first. Code must 100% comply with specs.

See [AGENTS.md](AGENTS.md) for the complete SDD workflow specification.

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

## Coding Conventions

### TypeScript / React

- **UI text**: Chinese (consistent with existing interface)
- **Client components**: Use `'use client'` only when necessary (hooks, event handlers, browser APIs like `window`, `document`, `localStorage`)
- **Pure logic**: Files in `lib/` should NOT have `'use client'`

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

### Code Organization

- **Small incremental changes**: Prefer modifying existing components over creating new top-level pages or global state layers
- **Hook consumers**: When modifying a hook's return type, check all consumers (`page.tsx` is the primary consumer)
- **File changes**: When deleting/renaming/moving files, update:
  - Tests
  - README (both English and Chinese)
  - Specs in `/specs/`
  - References in other files

## Key Architecture Points

For detailed architecture, see [RFC-0001: Core Architecture](specs/rfc/0001-core-architecture.md).

### Engine/Format Values

- Must come from `lib/diagramConfig.ts` — no magic strings in business code
- `DiagramDoc` structure: `{ id, name, engine, format, code, updatedAt }`

### Engine/Format Change Checklist

When modifying diagram engines, formats, or export capabilities, sync all affected files:

1. `lib/diagramConfig.ts` — type definitions, `ENGINE_CATEGORIES`, `getKrokiType`
2. `lib/diagramSamples.ts` — sample code
3. `lib/syntaxHighlight.ts` — CodeMirror language mapping
4. `lib/exportUtils.ts` — export format mapping
5. `hooks/useDiagramRender.ts` — local/remote render logic
6. `app/api/render/route.ts` — Kroki proxy, engine whitelist
7. `components/EditorPanel.tsx` — engine/format selector UI
8. `components/PreviewPanel.tsx` — preview rendering
9. `components/PreviewToolbar.tsx` — export entry points
10. `app/page.tsx` — top-level composition

### API Routes

| Endpoint | Description |
|----------|-------------|
| `POST /api/render` | Kroki proxy, in-memory cache (TTL 120s), 100KB limit, 10s timeout |
| `GET /api/healthz` | Health check for Docker/Netlify |

For full API specification, see [OpenAPI Specification](specs/api/openapi.yaml).

## Changelog Requirement

Every change must have a changelog entry:

1. Create file: `changelog/YYYY-MM-DD-<short-slug>.md`
2. Update summary in root `CHANGELOG.md`

## Quick Links

| Document | Purpose |
|----------|---------|
| [AGENTS.md](AGENTS.md) | AI agent workflow specification |
| [specs/README.md](specs/README.md) | Specifications index |
| [specs/rfc/0001-core-architecture.md](specs/rfc/0001-core-architecture.md) | Core architecture |
| [specs/api/openapi.yaml](specs/api/openapi.yaml) | API specification |
| [specs/db/schema-v1.dbml](specs/db/schema-v1.dbml) | Data models |
| [specs/testing/diagram-render.feature](specs/testing/diagram-render.feature) | Test specifications |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Contribution guide |
