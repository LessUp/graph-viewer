# Contributing to GraphViewer

Thank you for your interest in contributing to GraphViewer!

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Spec-Driven Development Workflow](#spec-driven-development-workflow)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Requirements](#testing-requirements)

## Code of Conduct

Be respectful, inclusive, and constructive in all interactions. We welcome contributors of all backgrounds and experience levels.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/graph-viewer.git`
3. Install dependencies: `npm install`
4. Start development server: `npm run dev`
5. Read the [specs/](specs/) directory to understand our specification structure

## Spec-Driven Development Workflow

This project follows **Spec-Driven Development (SDD)**. This means:

1. **Specs are the Single Source of Truth** — All implementation details are defined in `/specs/`
2. **Spec-First Approach** — Update or create specs before implementing code
3. **Code Must Follow Specs** — Implementation must 100% comply with spec definitions
4. **Tests Validate Specs** — Test cases must cover all acceptance criteria

### Spec Directory

```
specs/
├── product/          # Product features, roadmap, TODO
├── rfc/              # Technical design documents
├── api/              # API definitions (OpenAPI)
├── db/               # Data schema definitions
└── testing/          # BDD test specifications
```

For detailed workflow, see [AGENTS.md](AGENTS.md).

## How to Contribute

### Reporting Bugs

Before creating a bug report:
- Check existing issues for duplicates
- Verify the bug exists in the latest `main` branch

Include in your report:
- Clear description and steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Environment details (browser, OS, Node.js version)

### Suggesting Features

1. Check [Product Roadmap](specs/product/roadmap.md) and [Product TODO](specs/product/todo.md)
2. Open a GitHub Issue with:
   - Clear feature description
   - Use cases and user benefits
   - Proposed approach (optional)

### Code Contributions

1. **Pick an issue** from GitHub or [Product TODO](specs/product/todo.md)
2. **Review specs** in `/specs/` related to the issue
3. **Update/create specs** if needed (spec-first approach)
4. **Fork and branch** — Create a feature branch from `main`
5. **Implement** — Write code following specs 100%
6. **Test** — Write tests based on spec acceptance criteria
7. **Submit PR** — Include spec changes, test results, and screenshots for UI changes

## Development Setup

### Prerequisites

- Node.js 20+ and npm 10+
- Git

### Quick Setup

```bash
npm install           # Install dependencies
npm run dev           # Start dev server
npm run test          # Run tests
npm run lint          # Check code quality
npm run typecheck     # TypeScript check
```

### Useful Commands

```bash
npm run dev              # Start dev server on port 3000
npm run build            # Production build (with API routes)
npm run build:static     # Static export for GitHub Pages
npm run test             # Run unit tests
npm run test:watch       # Watch mode
npm run test:smoke       # Smoke tests
npm run lint             # ESLint check
npm run lint:fix         # Auto-fix ESLint issues
npm run format           # Prettier format
npm run typecheck        # TypeScript type check
```

## Pull Request Process

1. Update documentation if your changes affect them
2. Add changelog entry in `changelog/YYYY-MM-DD-<slug>.md`
3. Update root `CHANGELOG.md` summary
4. Ensure tests pass: `npm run test`
5. Ensure linting passes: `npm run lint && npm run typecheck`
6. Request review

### PR Checklist

- [ ] Code follows existing style
- [ ] Specs updated/created (if applicable)
- [ ] Tests added for new functionality
- [ ] All tests passing
- [ ] Linting passing
- [ ] Changelog entry added
- [ ] Documentation updated

## Coding Standards

- **TypeScript**: Strict mode enabled
- **Error handling**: Use `catch (e: unknown)` + `instanceof Error`
- **Client components**: Use `'use client'` only when necessary
- **No magic strings**: Engine/format values from `lib/diagramConfig.ts`
- **Small changes**: Prefer incremental changes

See [CLAUDE.md](CLAUDE.md) for detailed conventions.

## Testing Requirements

- **Unit tests**: Required for new lib functions
- **Integration tests**: Required for hooks and components
- **Smoke tests**: Must pass before merging

Test specs are defined in [specs/testing/](specs/testing/).

## Questions?

Open a GitHub Discussion or tag us in an issue.

Thank you for contributing! 🎉
