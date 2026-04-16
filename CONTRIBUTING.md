# Contributing to GraphViewer

Thank you for your interest in contributing to GraphViewer! This guide explains how to participate in development following our **Spec-Driven Development (SDD)** workflow.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Spec-Driven Development Workflow](#spec-driven-development-workflow)
- [How to Contribute](#how-to-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Features](#suggesting-features)
  - [Code Contributions](#code-contributions)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Requirements](#testing-requirements)
- [Documentation](#documentation)

## Code of Conduct

Be respectful, inclusive, and constructive in all interactions. We welcome contributors of all backgrounds and experience levels.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/graph-viewer.git`
3. Install dependencies: `npm install`
4. Start development server: `npm run dev`
5. Read the [specs/](specs/) directory to understand our specification structure

## Spec-Driven Development Workflow

**This project strictly follows Spec-Driven Development.** This means:

1. **Specs are the Single Source of Truth** — All implementation details must be defined in `/specs/` before coding.
2. **Spec-First Approach** — For new features or interface changes, you must update or create specs first.
3. **Code Must Follow Specs** — Implementation must 100% comply with spec definitions (no gold-plating).
4. **Tests Validate Specs** — Test cases must cover all acceptance criteria defined in specs.

### Spec Directory Structure

```
specs/
├── product/          # Product features, roadmap, TODO
├── rfc/              # Technical design documents
├── api/              # API definitions (OpenAPI)
├── db/               # Database/data schema definitions
└── testing/          # BDD test specifications
```

### How to Update Specs

1. Read existing specs to understand current behavior
2. Propose spec changes in your branch (new RFC or update existing spec)
3. Discuss the spec change in your PR before implementing code
4. Once spec is approved, implement code based on the spec
5. Write tests that validate against spec acceptance criteria

## How to Contribute

### Reporting Bugs

Before creating a bug report:
- Check existing issues for duplicates
- Verify the bug exists in the latest `main` branch

When creating a bug report, include:
- Clear description and steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Environment details (browser, OS, Node.js version)

### Suggesting Features

1. Check the [Product Roadmap](specs/product/roadmap.md) and [Product TODO](specs/product/todo.md) to see if it's already planned
2. Open a GitHub Issue with:
   - Clear feature description
   - Use cases and user benefits
   - Proposed implementation approach (optional)
3. If accepted, the feature will be added to `specs/product/` and prioritized in the roadmap

### Code Contributions

**Workflow for code contributions:**

1. **Pick an issue** from GitHub or check the [Product TODO](specs/product/todo.md)
2. **Review specs** related to the issue in `/specs/`
3. **Update/create specs** if the feature doesn't have specs yet
4. **Fork and branch** — Create a feature branch from `main`
5. **Implement** — Write code following specs 100%
6. **Test** — Write tests based on spec acceptance criteria
7. **PR** — Submit a pull request with:
   - Clear title and description
   - Link to related issue(s)
   - List of spec changes (if any)
   - Screenshots for UI changes
   - Test results

## Development Setup

### Prerequisites

- Node.js 20+ and npm 10+
- Git

### Quick Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm run test

# Check code quality
npm run lint
npm run typecheck
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

1. Update documentation (specs, README, etc.) if your changes affect them
2. Add a changelog entry in `changelog/YYYY-MM-DD-<slug>.md`
3. Update the root `CHANGELOG.md` summary
4. Ensure all tests pass: `npm run test`
5. Ensure linting passes: `npm run lint && npm run typecheck`
6. Request review from maintainers

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
- **Error handling**: Use `catch (e: unknown)` + `instanceof Error` narrowing
- **Client components**: Use `'use client'` only when necessary (hooks, browser APIs)
- **No magic strings**: Engine/format values must come from `lib/diagramConfig.ts`
- **Small changes**: Prefer incremental changes over large rewrites
- **Consistent naming**: Follow existing naming conventions

See [CLAUDE.md](CLAUDE.md) and [AGENTS.md](AGENTS.md) for detailed coding conventions.

## Testing Requirements

- **Unit tests**: Required for all new lib functions
- **Integration tests**: Required for hooks and components
- **Smoke tests**: Must pass before merging to `main`
- **Performance benchmarks**: Required for performance-critical code

Test specs are defined in `/specs/testing/`.

## Documentation

### Spec Documentation

- Keep specs concise and focused
- Use clear acceptance criteria
- Include examples where helpful
- Update specs alongside code changes

### User Documentation

- English docs in `docs/en/`
- Chinese docs in `docs/zh-CN/`
- Keep both versions in sync

### Changelog

Every change must have a changelog entry:
- File: `changelog/YYYY-MM-DD-<short-slug>.md`
- Update root `CHANGELOG.md` summary

---

**Questions?** Open a GitHub Discussion or tag us in an issue.

Thank you for contributing to GraphViewer! 🎉
