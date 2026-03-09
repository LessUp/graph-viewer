---
description: 格式化 → lint → 测试 → commit → push 一条龙流程，确保提交质量。
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

3. Run build to catch type errors:
   // turbo

```
npm run build
```

4. Stage all changes:

```
git add -A
```

5. Show staged diff summary for review:
   // turbo

```
git diff --cached --stat
```

6. Commit with a descriptive message using conventional commit format:

```
git commit -m "<type>(<scope>): <summary>"
```

Common types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `style`, `perf`.

7. Push to remote:

```
git push origin HEAD
```

8. If push is rejected (remote has new commits), pull and retry:

```
git pull --rebase origin HEAD
```

```
git push origin HEAD
```
