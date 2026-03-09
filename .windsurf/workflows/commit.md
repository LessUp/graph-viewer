---
description: Safe commit workflow — lint, format, test, then commit with a message
---

1. Auto-fix lint and format issues:
   // turbo

```
npm run lint:fix
```

// turbo

```
npm run format
```

2. Run tests to make sure nothing is broken:
   // turbo

```
npm run test
```

3. Stage all changes:

```
git add -A
```

4. Show staged diff summary for review:
   // turbo

```
git diff --cached --stat
```

5. Commit with a descriptive message. Use conventional commit format:

```
git commit -m "<type>(<scope>): <summary>"
```

Common types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `style`, `perf`.
