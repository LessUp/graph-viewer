# Specifications

> This directory contains all specification documents for GraphViewer.
> Following **Spec-Driven Development (SDD)** — specs are the Single Source of Truth.

## Directory Structure

```
specs/
├── product/            # Product features, roadmap, TODO
│   ├── roadmap.md      # Development phases and planning
│   └── todo.md         # Task backlog with priorities
├── rfc/                # Technical design documents
│   ├── 0001-core-architecture.md   # Core architecture decisions
│   └── 0002-api-design.md          # API design decisions
├── api/                # API definitions
│   └── openapi.yaml    # OpenAPI 3.0 specification
├── db/                 # Database/data schema definitions
│   └── schema-v1.dbml  # Data models and localStorage schema
└── testing/            # BDD test specifications
    └── diagram-render.feature  # Test cases for diagram rendering
```

## How to Use Specs

### For Contributors

1. **Before coding**: Read relevant specs in `/specs/`
2. **For new features**: Propose spec updates first (new RFC or update existing)
3. **During coding**: Follow specs 100% — no gold-plating
4. **For testing**: Write tests based on spec acceptance criteria

### For AI Agents

See [AGENTS.md](../AGENTS.md) for the complete SDD workflow. In short:

1. **Review Specs** — Read relevant specs before coding
2. **Update Specs First** — Propose spec changes before implementing
3. **Implement** — Code must 100% comply with specs
4. **Test** — Write tests based on acceptance criteria

## Specification Formats

| Type | Format | Location |
|------|--------|----------|
| Product | Markdown | `specs/product/*.md` |
| RFC | Markdown | `specs/rfc/NNNN-title.md` |
| API | OpenAPI YAML | `specs/api/*.yaml` |
| DB | DBML / Markdown | `specs/db/*.dbml` |
| Testing | Gherkin Feature | `specs/testing/*.feature` |

## Adding New Specs

1. **Product features**: Add to `specs/product/`
2. **Technical decisions**: Create `specs/rfc/NNNN-slug.md` (use next number)
3. **API changes**: Update `specs/api/openapi.yaml`
4. **Schema changes**: Update `specs/db/schema-v1.dbml`
5. **Test cases**: Add to `specs/testing/`

## Spec Document Guidelines

### RFC Naming Convention

RFCs should be numbered sequentially and have descriptive titles:

- `0001-core-architecture.md`
- `0002-api-design.md`
- `0003-feature-name.md`

### RFC Template

```markdown
# RFC-NNNN: Title

**Status**: Proposed | Accepted | Deprecated
**Created**: YYYY-MM-DD
**Author**: Name

## Context

[Describe the problem or situation]

## Decision

[Describe the decision made]

## Consequences

[Describe the impact of this decision]

## Alternatives Considered

[List alternatives that were considered but rejected]
```

### Product Spec Guidelines

Product specs should include:

- Feature description
- User stories / use cases
- Acceptance criteria
- Priority and status

## Related Documents

- [AGENTS.md](../AGENTS.md) — AI agent workflow specification
- [CLAUDE.md](../CLAUDE.md) — Claude Code instructions
- [CONTRIBUTING.md](../CONTRIBUTING.md) — Contribution guide
