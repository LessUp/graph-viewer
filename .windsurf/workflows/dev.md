---
description: Start the GraphViewer development environment
---

1. Install dependencies if needed:
// turbo
```
npm install
```

2. Check if port 3000 is already in use:
// turbo
```
npx detect-port 3000
```

3. Run a quick typecheck before starting:
// turbo
```
npm run typecheck
```

4. Start the dev server:
```
npm run dev
```

5. Open browser at http://localhost:3000

6. Verify:
   - Page loads without errors
   - Default Mermaid diagram renders in the preview panel
   - Engine selector and format selector work
   - Live preview updates when code changes
