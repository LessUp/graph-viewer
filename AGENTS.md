# AGENTS.md — AI Agent Workflow Specification

> This file defines the AI agent workflow for GraphViewer.
> For project-specific coding conventions, see [CLAUDE.md](CLAUDE.md).

## Project Philosophy: Spec-Driven Development (SDD)

This project strictly follows the **Spec-Driven Development (SDD)** paradigm with **OpenSpec** for change management. All code implementations must use `openspec/specs/` as the Single Source of Truth.

## Directory Context

| Directory                      | Purpose                                     |
| ------------------------------ | ------------------------------------------- |
| `openspec/specs/product/`      | Product features, roadmap, TODO             |
| `openspec/specs/architecture/` | Technical design documents (RFCs)           |
| `openspec/specs/api/`          | API interface definitions (OpenAPI)         |
| `openspec/specs/data/`         | Data model definitions                      |
| `openspec/specs/testing/`      | BDD test specifications                     |
| `openspec/changes/`            | Active change proposals                     |
| `openspec/changes/archive/`    | Archived changes                            |
| `docs/`                        | User documentation, tutorials, setup guides |

## OpenSpec Workflow

### Quick Reference

| Command         | Purpose                                                           |
| --------------- | ----------------------------------------------------------------- |
| `/opsx:explore` | Investigate codebase, clarify requirements                        |
| `/opsx:propose` | Create change with all artifacts (proposal, specs, design, tasks) |
| `/opsx:apply`   | Implement tasks from tasks.md                                     |
| `/opsx:archive` | Finalize and merge delta specs                                    |

### OpenSpec Directory Structure

```
openspec/
├── config.yaml           # Project configuration (context, rules)
├── specs/                # System behavior specs (source of truth)
│   └── <domain>/
│       └── spec.md
├── changes/              # Proposed updates (one folder per change)
│   └── <change-name>/
│       ├── proposal.md   # Why & what
│       ├── specs/        # Delta specs (ADDED/MODIFIED/REMOVED)
│       ├── design.md     # How (technical approach)
│       └── tasks.md      # Implementation checklist
└── archive/              # Archived changes
```

## AI Agent Workflow Instructions

When you (AI) are asked to implement a new feature, modify existing functionality, or fix a bug, **you MUST strictly follow this workflow without skipping any steps**:

### Step 1: Explore (探索)

```
/opsx:explore
```

- Investigate the codebase to understand the problem
- Read relevant specs in `openspec/specs/`
- Clarify requirements with the user
- Do NOT implement code in this phase

### Step 2: Propose (提案)

```
/opsx:propose <feature-name>
```

This creates:

- `openspec/changes/<name>/proposal.md` — Intent, scope, approach
- `openspec/changes/<name>/specs/` — Delta specs (ADDED/MODIFIED/REMOVED requirements)
- `openspec/changes/<name>/design.md` — Technical design
- `openspec/changes/<name>/tasks.md` — Implementation checklist

**Wait for user confirmation** on the proposal before proceeding to implementation.

### Step 3: Apply (实现)

```
/opsx:apply
```

- Work through tasks, checking them off as you go
- Update artifacts if you discover design issues during implementation
- When writing code, **100% comply with spec definitions**
- **No Gold-Plating**: Do not add features not defined in the specs
- Follow existing coding conventions defined in `CLAUDE.md`

### Step 4: Archive (归档)

```
/opsx:archive
```

- Merges delta specs into main specs
- Moves change to `openspec/changes/archive/`

## When to Use OpenSpec vs Direct Edits

| Scenario                   | Use                                                 |
| -------------------------- | --------------------------------------------------- |
| New feature development    | OpenSpec (`/opsx:propose`)                          |
| Bug fix with design impact | OpenSpec (`/opsx:propose`)                          |
| Quick typo/small fix       | Direct edit, update specs if needed                 |
| API contract changes       | OpenSpec + update `openspec/specs/api/openapi.yaml` |
| Architecture decision      | Create RFC in `openspec/specs/architecture/`        |

## Code Generation Rules

- Any externally exposed API changes **must** sync with `openspec/specs/api/openapi.yaml`.
- If uncertain about technical details, consult `openspec/specs/architecture/` for architecture conventions. **Do not invent design patterns.**
- For diagram engine or format changes, follow the Engine/Format Change Checklist in CLAUDE.md.

## Why This Workflow?

| Problem                      | Solution                                                                |
| ---------------------------- | ----------------------------------------------------------------------- |
| AI hallucination             | Forcing spec review first anchors AI thinking within defined boundaries |
| Code-documentation drift     | "Update specs before code" ensures they stay synchronized               |
| Inconsistent implementations | Spec definitions provide concrete contracts to follow                   |
| Unclear acceptance criteria  | `openspec/specs/testing/` provides explicit test requirements           |
| Lost context across sessions | OpenSpec preserves change history in `openspec/changes/`                |

## Quick Reference

### Commands

```bash
# Development
npm run dev              # Start dev server on port 3000
npm run build            # Standard build (with API routes)
npm run build:static     # Static export for GitHub Pages
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

# OpenSpec CLI
openspec status          # Show change status
openspec list            # List active changes
```

### Architecture Overview

**GraphViewer** is a Next.js 15 + React 19 app for visualizing 16+ diagram engines with hybrid rendering (local WASM + remote Kroki).

For detailed architecture, see [RFC-0001: Core Architecture](openspec/specs/architecture/0001-core-architecture.md).

### API Routes

| Endpoint           | Description                                                           |
| ------------------ | --------------------------------------------------------------------- |
| `POST /api/render` | Kroki proxy with in-memory cache (TTL 120s), 100KB limit, 10s timeout |
| `GET /api/healthz` | Health check for Docker/Netlify                                       |

For full API specification, see [OpenAPI Specification](openspec/specs/api/openapi.yaml).

## Related Documents

- [CLAUDE.md](CLAUDE.md) — Claude Code specific instructions and coding conventions
- [CONTRIBUTING.md](CONTRIBUTING.md) — Contribution guide for human contributors
- [openspec/specs/README.md](openspec/specs/README.md) — Specifications directory index
- [OpenSpec Docs](https://github.com/Fission-AI/OpenSpec) — OpenSpec documentation
