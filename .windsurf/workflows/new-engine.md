---
description: Add a new diagram engine to GraphViewer end-to-end
---

1. Use the `graphviewer-engine-extension` skill for detailed guidance.

2. Add the engine type and metadata in `lib/diagramConfig.ts`:
   - Add to `Engine` type
   - Add label, category, `ENGINE_CATEGORIES` entry
   - Add `supportsLocalRender` flag
   - Add `getKrokiType` mapping

3. Add a sample snippet in `lib/diagramSamples.ts`.

4. Add syntax highlighting mapping in `lib/syntaxHighlight.ts`.

5. Verify editor UI shows the new engine in `components/EditorPanel.tsx`.

6. Verify rendering works in `hooks/useDiagramRender.ts` — check local vs remote path.

7. Verify the API route allowlist in `app/api/render/route.ts`.

8. Verify preview in `components/PreviewPanel.tsx` and export in `lib/exportUtils.ts`.

9. Run validation:
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

10. Start dev server and manually test:

```
npm run dev
```

    - Select the new engine in the editor
    - Verify sample renders
    - Switch SVG / PNG / PDF
    - Test export

11. Commit using the `/commit` workflow.
