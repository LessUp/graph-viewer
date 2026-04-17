# Changelog: Documentation Restructure

**Date**: 2026-04-17
**Type**: Documentation
**Impact**: Low (no code changes)

## Summary

Reorganized project documentation to follow Spec-Driven Development (SDD) best practices with clear separation of concerns.

## Changes

### New Structure

```
├── README.md              # English (default), links to Chinese version
├── README.zh-CN.md        # Chinese README
├── CLAUDE.md              # Claude Code specific instructions (slimmed)
├── AGENTS.md              # AI agent workflow specification (rewritten)
├── CONTRIBUTING.md        # Contribution guide (updated)
├── CHANGELOG.md           # Version history
├── ROADMAP.md             # Pointer to specs/product/roadmap.md
├── TODO.md                # Pointer to specs/product/todo.md
├── specs/                 # Specifications (Single Source of Truth)
│   ├── README.md          # Specs index (enhanced)
│   ├── product/           # Product docs
│   ├── rfc/               # Technical RFCs
│   ├── api/               # OpenAPI definitions
│   ├── db/                # Data schemas
│   └── testing/           # BDD test specs
├── docs/                  # User documentation
│   ├── en/                # English
│   └── zh-CN/             # Chinese
└── .windsurf/             # Windsurf IDE config (preserved)
```

### Files Modified

- `AGENTS.md` — Rewritten with clear SDD workflow, references specs instead of duplicating
- `CLAUDE.md` — Slimmed down, references specs for architecture details
- `CONTRIBUTING.md` — Updated to reference specs, simplified
- `README.md` — Updated with links to specs
- `README.zh-CN.md` — Updated with links to specs
- `specs/README.md` — Enhanced with RFC template and guidelines
- `specs/rfc/0001-core-architecture.md` — Added references to related docs
- `specs/rfc/0002-api-design.md` — Added references to related docs
- `docs/README.md` — Simplified, removed archive reference

### Files/Directories Removed

- `docs/archive/` — Historical documents removed
- `docs/architecture/` — Empty directory removed
- `docs/assets/` — Empty directory removed
- `docs/setup/` — Empty directory removed
- `docs/tutorials/` — Empty directory removed

### Directories Preserved

- `.windsurf/` — Windsurf IDE configuration (user request)

## Rationale

1. **Single Source of Truth**: Architecture details now live in `specs/rfc/` only
2. **Clear Role Separation**:
   - `CLAUDE.md` — Claude Code specific instructions
   - `AGENTS.md` — AI agent workflow
   - `specs/` — Technical specifications
   - `docs/` — User documentation
3. **No Redundancy**: Removed duplicate architecture descriptions across multiple files
4. **GitHub Best Practices**: English README as default, bilingual support

## Testing

- [ ] Verify all internal links work
- [ ] Verify README renders correctly on GitHub
- [ ] Verify specs directory structure matches documentation
