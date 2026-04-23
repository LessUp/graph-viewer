# Specifications

> This directory contains all specification documents for GraphViewer.
> Following **Spec-Driven Development (SDD)** with **OpenSpec** — specs are the Single Source of Truth.

## Directory Structure

```
openspec/specs/
├── product/            # Product features, roadmap, TODO
│   ├── roadmap.md      # Development phases and planning
│   └── todo.md         # Task backlog with priorities
├── architecture/       # Technical design documents (RFCs)
│   ├── 0001-core-architecture.md   # Core architecture decisions
│   └── 0002-api-design.md          # API design decisions
├── api/                # API definitions
│   └── openapi.yaml    # OpenAPI 3.0 specification
├── data/               # Database/data schema definitions
│   └── schema-v1.dbml  # Data models and localStorage schema
└── testing/            # BDD test specifications
    └── diagram-render.feature  # Test cases for diagram rendering
```

## How to Use Specs

### For Contributors

1. **Before coding**: Read relevant specs in `openspec/specs/`
2. **For new features**: Use `/opsx:propose` to create a change proposal
3. **During coding**: Follow specs 100% — no gold-plating
4. **For testing**: Write tests based on spec acceptance criteria

### For AI Agents

See [AGENTS.md](../../AGENTS.md) for the complete OpenSpec workflow. In short:

1. **Explore** — `/opsx:explore` to investigate and clarify
2. **Propose** — `/opsx:propose` to create change with artifacts
3. **Apply** — `/opsx:apply` to implement tasks
4. **Archive** — `/opsx:archive` to finalize and merge specs

## Specification Formats

| Type               | Format          | Location                                    |
| ------------------ | --------------- | ------------------------------------------- |
| Product            | Markdown        | `openspec/specs/product/*.md`               |
| Architecture (RFC) | Markdown        | `openspec/specs/architecture/NNNN-title.md` |
| API                | OpenAPI YAML    | `openspec/specs/api/*.yaml`                 |
| Data               | DBML / Markdown | `openspec/specs/data/*.dbml`                |
| Testing            | Gherkin Feature | `openspec/specs/testing/*.feature`          |

## Adding New Specs

1. **Product features**: Add to `openspec/specs/product/`
2. **Technical decisions**: Create `openspec/specs/architecture/NNNN-slug.md` (use next number)
3. **API changes**: Update `openspec/specs/api/openapi.yaml`
4. **Schema changes**: Update `openspec/specs/data/schema-v1.dbml`
5. **Test cases**: Add to `openspec/specs/testing/`

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

- [AGENTS.md](../../AGENTS.md) — AI agent workflow specification (OpenSpec)
- [CLAUDE.md](../../CLAUDE.md) — Claude Code instructions
- [CONTRIBUTING.md](../../CONTRIBUTING.md) — Contribution guide
- [OpenSpec Docs](https://github.com/Fission-AI/OpenSpec) — OpenSpec documentation
