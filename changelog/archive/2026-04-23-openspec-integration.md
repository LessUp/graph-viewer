# OpenSpec Integration

**Date**: 2026-04-23
**Type**: Infrastructure
**Impact**: High

## Summary

完全采用 OpenSpec CLI 框架管理项目规范和变更流程，统一 SDD (Spec-Driven Development) 工作流。

## Changes

### Directory Structure

- **Migrated**: `specs/` → `openspec/specs/`
  - `specs/product/` → `openspec/specs/product/`
  - `specs/rfc/` → `openspec/specs/architecture/`
  - `specs/api/` → `openspec/specs/api/`
  - `specs/db/` → `openspec/specs/data/`
  - `specs/testing/` → `openspec/specs/testing/`
- **New**: `openspec/config.yaml` — Project configuration
- **New**: `openspec/README.md` — OpenSpec usage documentation

### Documentation Updates

- **Updated**: `AGENTS.md` — All paths updated to `openspec/specs/`
- **Updated**: `CLAUDE.md` — Added OpenSpec CLI commands, updated paths
- **Updated**: `QWEN.md` — Updated paths
- **Updated**: `CONTRIBUTING.md` — Updated paths
- **Updated**: `README.md`, `README.zh-CN.md` — Updated architecture links
- **Updated**: `docs/README.md` — Updated key resources links
- **Updated**: `.windsurf/skills/openspec-explore/SKILL.md` — Fixed spec paths
- **Updated**: `.windsurf/workflows/opsx-explore.md` — Fixed spec paths

### Configuration

- **New**: `openspec/config.yaml` with:
  - Project metadata (name, description)
  - Context for AI agents (tech stack, architecture, constraints)
  - Rules (Chinese UI, engine/format sources, changelog requirement)
  - Profile: `core`

### Deleted

- `specs/` directory (migrated to `openspec/specs/`)

## Impact

### For Developers

- Use `/opsx:propose` to create new feature proposals
- All specs now live in `openspec/specs/`
- Changelog entries still required for all changes

### For AI Agents

- Updated workflow: `/opsx:explore` → `/opsx:propose` → `/opsx:apply` → `/opsx:archive`
- Specs are now at `openspec/specs/` instead of `specs/`
- Windsurf skills and workflows already compatible

## Verification

```bash
# Check OpenSpec is working
npx @fission-ai/openspec@latest --version
# Output: 1.3.1

# List active changes
npx @fission-ai/openspec@latest list
```

## Related

- [OpenSpec Documentation](https://github.com/Fission-AI/OpenSpec)
- [AGENTS.md](../AGENTS.md) — Updated workflow specification
