---
name: graphviewer-engine-extension
description: Add or modify diagram engines, formats, samples, and editor integration in the graph-viewer project.
---

# When to use

Use this skill when:

- Adding a new diagram engine
- Adjusting engine labels, grouping, or documentation links
- Changing which formats are supported
- Updating syntax highlighting or samples
- Wiring a new engine through editor, render, preview, and export flows

# Core files

- `lib/diagramConfig.ts`
  - engine and format types, `ENGINE_CATEGORIES`
  - labels, categories, local-render support
  - Kroki type mapping via `getKrokiType`
- `lib/diagramSamples.ts`
  - starter snippets for each engine
- `lib/syntaxHighlight.ts`
  - CodeMirror language mapping per engine
- `lib/types.ts`
  - shared type definitions (`DiagramDoc`, etc.)
- `hooks/useDiagramState.ts`
  - persisted engine / format state, `hasHydrated`
- `hooks/useDiagramRender.ts`
  - render behavior and local/remote fallback, `buildApiErrorMessage`
- `hooks/useLivePreview.ts`
  - debounced auto-render
- `components/EditorPanel.tsx`
  - engine / format selector UI with `ENGINE_CATEGORIES` grouping
- `components/CodeEditor.tsx`
  - CodeMirror editor, uses `syntaxHighlight.ts`
- `components/PreviewPanel.tsx`
  - format-specific preview rendering
- `lib/exportUtils.ts`
  - export format mapping
- `app/api/render/route.ts`
  - Kroki proxying, engine allowlist
- `hooks/useAIAssistant.ts` / `hooks/useAIActions.ts`
  - AI prompts may reference engine names

# Required implementation checklist

1. Add the new engine or format type definition in `lib/diagramConfig.ts`
2. Add labels, category grouping, and `ENGINE_CATEGORIES` entry
3. Add or update sample code in `lib/diagramSamples.ts`
4. Add CodeMirror language mapping in `lib/syntaxHighlight.ts`
5. Ensure state persistence works in `useDiagramState.ts`
6. Ensure rendering works in `useDiagramRender.ts`
7. Ensure preview logic supports the output format in `PreviewPanel.tsx`
8. Ensure export mappings remain correct in `lib/exportUtils.ts`
9. Verify API route allowlist in `app/api/render/route.ts`
10. Check whether AI assistant prompts need updates for the new engine

# Invariants

- `Engine` and `Format` types must stay aligned with selector UI
- Any `supportsLocalRender` change must match actual implementation support
- `getKrokiType` must remain valid for remote rendering
- The editor sample should be valid enough to render immediately

# Validation checklist

- New engine appears in the editor UI
- Sample renders successfully
- Diagram state persists after reload
- Preview works in all supported formats
- Export behavior still matches the selected engine / format
- Run:
  - `npm run lint`
  - `npm run build`
  - `npm run test:smoke`
