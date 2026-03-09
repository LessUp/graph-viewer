---
description: Pre-release quality gate for GraphViewer
---

1. Run full quality checks:
// turbo
```
npm run lint
```

2. Run tests:
// turbo
```
npm run test
```

3. Build the project:
// turbo
```
npm run build
```

4. Start dev server and run smoke tests:
```
npm run dev
```
```
npm run test:smoke
```

5. Manual verification:
   - Main page loads correctly
   - Mermaid sample renders
   - Graphviz sample renders
   - SVG / PNG / PDF format switching works
   - Export actions work
   - Settings modal opens and saves

6. Check documentation is up to date:
   - `README.md`
   - `CHANGELOG.md`
   - `ROADMAP.md`

7. Commit and push. If deploying to Netlify, verify the deploy preview.
