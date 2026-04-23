# OpenSpec — GraphViewer

> This directory manages all specifications and change proposals using [OpenSpec](https://github.com/Fission-AI/OpenSpec).

## What is OpenSpec?

OpenSpec is a Spec-Driven Development (SDD) framework that helps humans and AI agents "agree on what to build before any code is written." It provides:

- **Change Proposals** — Structured workflow for proposing, designing, and implementing changes
- **Living Specs** — Specifications that evolve as features are implemented
- **AI Integration** — Skills for Windsurf, Cursor, and other AI tools

## Directory Structure

```
openspec/
├── config.yaml          # Project configuration
├── specs/               # All specification documents (Single Source of Truth)
│   ├── product/         # Roadmap, TODO
│   ├── architecture/    # Technical design documents (RFCs)
│   ├── api/             # OpenAPI specifications
│   ├── data/            # Database/data schemas
│   └── testing/         # BDD test specifications
└── changes/             # Change proposals workspace
    ├── <change-name>/   # Active changes
    │   ├── proposal.md  # What & Why
    │   ├── design.md    # How (technical approach)
    │   ├── tasks.md     # Implementation checklist
    │   └── specs/       # Delta specs (ADDED/MODIFIED/REMOVED)
    └── archive/         # Completed changes (YYYY-MM-DD-<name>)
```

## Workflow

| Command         | Purpose                                    |
| --------------- | ------------------------------------------ |
| `/opsx:explore` | Investigate problems, clarify requirements |
| `/opsx:propose` | Create a change with all artifacts         |
| `/opsx:apply`   | Implement tasks from a change              |
| `/opsx:archive` | Finalize and archive a completed change    |

## CLI Commands

```bash
# Verify installation
npx @fission-ai/openspec@latest --version

# Check project status
npx @fission-ai/openspec@latest status

# List active changes
npx @fission-ai/openspec@latest list
```

## Getting Started

1. **Explore** your idea with `/opsx:explore`
2. **Propose** a change with `/opsx:propose <name>`
3. **Apply** the change with `/opsx:apply`
4. **Archive** when done with `/opsx:archive`

## Related Documentation

- [AGENTS.md](../AGENTS.md) — AI agent workflow specification
- [CLAUDE.md](../CLAUDE.md) — Claude Code instructions
- [specs/README.md](specs/README.md) — Specifications index
- [OpenSpec Docs](https://github.com/Fission-AI/OpenSpec) — Official documentation
