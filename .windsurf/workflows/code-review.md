---
description: 提交前代码审查：分析 diff、检查潜在问题、生成审查清单。
---

1. View the current changes:
   // turbo

```
git diff --stat
```

// turbo

```
git diff
```

2. Check for lint issues:
   // turbo

```
npm run lint
```

3. Check for format issues:
   // turbo

```
npm run format:check
```

4. Run tests:
   // turbo

```
npm run test
```

5. Run typecheck:
   // turbo

```
npm run typecheck
```

6. Use the `graphviewer-code-review` skill to perform a structured review covering:
   - Type safety (no `any`, proper error narrowing)
   - Architecture compliance (reuse existing hooks/modules)
   - Security (SVG sanitization, input validation)
   - Performance (dynamic imports, stable references)
   - UI/UX (Chinese text, error messages)
   - Testing (new logic has tests)
   - Documentation sync (README, CHANGELOG, .env.example)

7. If the changeset modifies engines/formats/rendering, verify the engine sync checklist:
   - `lib/diagramConfig.ts`
   - `lib/diagramSamples.ts`
   - `lib/syntaxHighlight.ts`
   - `lib/exportUtils.ts`
   - `hooks/useDiagramRender.ts`
   - `app/api/render/route.ts`
   - `components/EditorPanel.tsx`
   - `components/PreviewPanel.tsx`

8. Produce a structured review summary:
   - **Summary**: what changed and why
   - **Pass/Fail**: overall assessment
   - **Issues**: categorized as critical / warning / suggestion
   - **Required actions**: what must be fixed before commit
