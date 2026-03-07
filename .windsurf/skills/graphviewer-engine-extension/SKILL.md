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
  - engine and format types
  - labels, categories, local-render support
  - Kroki type mapping
- `lib/diagramSamples.ts`
  - starter snippets for each engine
- `lib/syntaxHighlight.ts`
  - CodeMirror language mapping
- `hooks/useDiagramState.ts`
  - persisted engine / format state
- `hooks/useDiagramRender.ts`
  - render behavior and local/remote fallback
- `components/EditorPanel.tsx`
  - engine / format selector UI
- `components/PreviewPanel.tsx`
  - format-specific preview rendering
- `lib/exportUtils.ts`
  - export format mapping

# Required implementation checklist

1. Add the new engine or format type definition
2. Add labels and user-facing names
3. Add or update sample code
4. Confirm syntax highlighting behavior
5. Ensure state persistence works in `useDiagramState.ts`
6. Ensure rendering works in `useDiagramRender.ts`
7. Ensure preview logic supports the output format
8. Ensure export mappings remain correct
9. Check whether AI assistant prompts need updates for the new engine

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
