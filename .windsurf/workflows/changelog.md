---
description: Write a changelog entry for a completed feature or fix
---

1. Determine the change type:
   - Feature, fix, refactor, docs, performance, or breaking change

2. Create a new changelog file following the naming convention:
   - Path: `changelog/YYYY-MM-DD-<short-slug>.md`
   - Example: `changelog/2026-03-09-add-bpmn-engine.md`

3. Use this template:

```markdown
# <Title>

**Date**: YYYY-MM-DD
**Type**: feat / fix / refactor / docs / perf / breaking

## Summary

One-paragraph description of what changed and why.

## Changes

- Bullet list of specific changes
- Reference file paths where relevant

## Impact

- What users or developers should be aware of
- Any migration steps if breaking
```

4. Update `CHANGELOG.md` at the project root with a one-line summary linking to the new entry.

5. Commit using the `/commit` workflow with type `docs`.
