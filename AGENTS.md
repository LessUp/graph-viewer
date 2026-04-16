# AGENTS.md - AI Agent Instructions

## Project Philosophy: Spec-Driven Development (SDD)

This project strictly follows the **Spec-Driven Development (SDD)** paradigm. All code implementations must use the `/specs` directory as the Single Source of Truth.

## Directory Context

| Directory | Purpose |
|-----------|---------|
| `/specs/product/` | Product feature definitions, acceptance criteria, roadmap, TODO |
| `/specs/rfc/` | Technical design documents and architecture decisions |
| `/specs/api/` | API interface definitions (OpenAPI, GraphQL schemas) |
| `/specs/db/` | Database schema definitions and migrations |
| `/specs/testing/` | BDD test specifications and acceptance test criteria |
| `/docs/` | User documentation, tutorials, setup guides |

## AI Agent Workflow Instructions

When you (AI) are asked to implement a new feature, modify existing functionality, or fix a bug, **you MUST strictly follow this workflow without skipping any steps**:

### Step 1: Review Specs (审查与分析)

- First, read the relevant product docs, RFCs, and API definitions in `/specs/`.
- If the user's request conflicts with existing specs, **stop immediately** and point out the conflict. Ask the user whether to update the specs first.
- If no spec exists for the requested change, proceed to Step 2.

### Step 2: Spec-First Update (规范优先)

- For new features or changes affecting interfaces/database, **you MUST first propose modifying or creating the relevant spec documents** (e.g., `specs/product/*.md`, `specs/rfc/*.md`, `specs/api/*.yaml`).
- Wait for user confirmation on the spec changes before entering the code implementation phase.
- This ensures **Document-Code Synchronization** — specs and code are always in sync.

### Step 3: Implementation (代码实现)

- When writing code, you must **100% comply with spec definitions** (including variable naming, API paths, data types, status codes, etc.).
- **No Gold-Plating**: Do not add features not defined in the specs.
- Follow existing coding conventions defined in `CLAUDE.md`.

### Step 4: Test against Spec (测试验证)

- Write unit and integration tests based on acceptance criteria in `/specs/`.
- Ensure test cases cover all boundary conditions described in the specs.
- Reference spec test definitions in `/specs/testing/`.

## Code Generation Rules

- Any externally exposed API changes **must** sync with `/specs/api/` definitions.
- If uncertain about technical details, consult `/specs/rfc/` for architecture conventions. **Do not invent design patterns.**
- For diagram engine or format changes, follow the checklist in `CLAUDE.md`.

## Commands Reference

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

# Code Quality
npm run lint             # ESLint check
npm run lint:fix         # Auto-fix ESLint issues
npm run format           # Prettier format
npm run typecheck        # TypeScript type check (tsc --noEmit)
```

## Architecture Overview

**GraphViewer** is a Next.js 15 + React 19 app for visualizing 16+ diagram engines with hybrid rendering (local WASM + remote Kroki).

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

- **Engine/Format values** must come from `lib/diagramConfig.ts` — no magic strings.
- **`DiagramDoc` structure**: `{ id, name, engine, format, code, updatedAt }`.
- When modifying engine/format/export, sync all affected files (see `CLAUDE.md` for full checklist).

### API Routes

- `POST /api/render` — Kroki proxy, in-memory cache (TTL 120s), 100KB code limit, 10s timeout.
- `GET /api/healthz` — Health check for Docker/Netlify.

## Coding Conventions

- `'use client'` only when using hooks, event handlers, or browser APIs.
- Error handling: `catch (e: unknown)` + `instanceof Error` narrowing.
- Prefer small incremental changes over creating new top-level pages or global state.
- When deleting/renaming/moving files, update tests, README, specs, and references.
- When modifying a hook's return type, check all consumers (`page.tsx` is primary).

## Changelog Requirement

Every change must have a changelog entry:
- File path: `changelog/YYYY-MM-DD-<short-slug>.md`
- Update the root `CHANGELOG.md` summary after adding a changelog file.
