---
name: verify
description: Run lint, typecheck, and tests to verify code quality before committing.
---

Run the following commands in sequence:

1. `npm run lint` — ESLint check
2. `npm run typecheck` — TypeScript type check
3. `npm run test` — Vitest unit tests

Report any failures. If all pass, confirm the codebase is ready for commit.
