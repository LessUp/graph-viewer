# CLAUDE.md

> This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.
> For AI agent workflow, see [AGENTS.md](AGENTS.md).

## Project Philosophy: Spec-Driven Development (SDD)

This project follows the **Spec-Driven Development (SDD)** paradigm with **OpenSpec**. All code implementations must use `openspec/specs/` as the Single Source of Truth.

**Core Principle**: Before coding, read specs. For new features, use `/opsx:propose` first. Code must 100% comply with specs.

See [AGENTS.md](AGENTS.md) for the complete OpenSpec workflow specification.

## OpenSpec CLI

```bash
# Verify installation
openspec --version

# Check project status
openspec status

# List active changes
openspec list
```

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
  - Specs in `openspec/specs/`
  - References in other files

## Key Architecture Points

For detailed architecture, see [RFC-0001: Core Architecture](openspec/specs/architecture/0001-core-architecture.md).

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

| Endpoint           | Description                                                       |
| ------------------ | ----------------------------------------------------------------- |
| `POST /api/render` | Kroki proxy, in-memory cache (TTL 120s), 100KB limit, 10s timeout |
| `GET /api/healthz` | Health check for Docker/Netlify                                   |

For full API specification, see [OpenAPI Specification](openspec/specs/api/openapi.yaml).

## Changelog Requirement

Every change must have a changelog entry:

1. Create file: `changelog/YYYY-MM-DD-<short-slug>.md`
2. Update summary in root `CHANGELOG.md`

## Quick Links

| Document                                                                                                       | Purpose                         |
| -------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| [AGENTS.md](AGENTS.md)                                                                                         | AI agent workflow specification |
| [openspec/specs/README.md](openspec/specs/README.md)                                                           | Specifications index            |
| [openspec/specs/architecture/0001-core-architecture.md](openspec/specs/architecture/0001-core-architecture.md) | Core architecture               |
| [openspec/specs/api/openapi.yaml](openspec/specs/api/openapi.yaml)                                             | API specification               |
| [openspec/specs/data/schema-v1.dbml](openspec/specs/data/schema-v1.dbml)                                       | Data models                     |
| [openspec/specs/testing/diagram-render.feature](openspec/specs/testing/diagram-render.feature)                 | Test specifications             |
| [CONTRIBUTING.md](CONTRIBUTING.md)                                                                             | Contribution guide              |
| [OpenSpec Docs](https://github.com/Fission-AI/OpenSpec)                                                        | OpenSpec documentation          |
