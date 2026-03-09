---
description: Debug and fix a bug in GraphViewer — diagnose, fix, verify
---

1. Reproduce the bug. Identify the failing behavior:
   - Which engine / format / component is affected?
   - Is it a render issue, UI issue, or data issue?

2. Use the appropriate skill for investigation:
   - Render/preview/export bug → use `graphviewer-render-debug` skill
   - UI/state bug → use `graphviewer-ui-state-change` skill
   - Engine/format bug → use `graphviewer-engine-extension` skill

3. Locate the root cause. Read the relevant source files and trace the data flow.

4. Write or update a test that reproduces the bug:
   // turbo

```
npx vitest run --reporter=verbose
```

5. Implement the minimal fix. Prefer upstream root-cause fixes over downstream workarounds.

6. Verify the fix:
   // turbo

```
npm run lint
```

// turbo

```
npm run test
```

// turbo

```
npm run build
```

7. If the dev server is running, manually verify in the browser.

8. Commit using the `/commit` workflow.
