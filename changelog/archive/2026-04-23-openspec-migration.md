# OpenSpec Migration

## Summary

Migrated the project to fully adopt OpenSpec specification for Spec-Driven Development (SDD).

## Changes

### Added

- `openspec/config.yaml` - Project configuration with context and rules
- OpenSpec CLI generated skills in `.windsurf/skills/openspec-*`
- OpenSpec CLI generated workflows in `.windsurf/workflows/opsx-*.md`

### Changed

- **Directory Structure**: Migrated `specs/` → `openspec/specs/`
  - `specs/product/` → `openspec/specs/product/`
  - `specs/rfc/` → `openspec/specs/architecture/`
  - `specs/api/` → `openspec/specs/api/`
  - `specs/db/` → `openspec/specs/data/`
  - `specs/testing/` → `openspec/specs/testing/`

- **AI Instructions Updated**:
  - `AGENTS.md` - Rewritten with OpenSpec workflow
  - `CLAUDE.md` - Updated spec paths, added OpenSpec CLI section
  - `QWEN.md` - Synced OpenSpec changes

- **Documentation Updated**:
  - `README.md` - Updated architecture RFC link
  - `README.zh-CN.md` - Updated architecture RFC link
  - `CONTRIBUTING.md` - Rewritten SDD section with OpenSpec workflow

### Removed

- `specs/` directory (migrated to `openspec/specs/`)

## OpenSpec Workflow

Now using Core Profile with 4 commands:

| Command         | Purpose                                    |
| --------------- | ------------------------------------------ |
| `/opsx:explore` | Investigate codebase, clarify requirements |
| `/opsx:propose` | Create change with all artifacts           |
| `/opsx:apply`   | Implement tasks from tasks.md              |
| `/opsx:archive` | Finalize and merge delta specs             |

## Related

- [OpenSpec Documentation](https://github.com/Fission-AI/OpenSpec)
- [AGENTS.md](../AGENTS.md) - Complete OpenSpec workflow specification
