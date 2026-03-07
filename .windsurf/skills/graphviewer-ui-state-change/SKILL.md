---
name: graphviewer-ui-state-change
description: Modify GraphViewer UI, component composition, and state flow safely across page, hooks, and preview/editor panels.
---

# When to use

Use this skill when:

- Changing layout or panel composition in `app/page.tsx`
- Editing editor / preview / sidebar interactions
- Wiring new UI controls to existing hooks
- Refactoring state flow between `page.tsx`, hooks, and components
- Fixing bugs where UI state and rendered output go out of sync

# Key files

- `app/page.tsx`
  - top-level composition
  - panel switching
  - hook orchestration
- `components/EditorPanel.tsx`
  - engine / format selector
  - render actions
  - editor controls
- `components/PreviewPanel.tsx`
  - preview rendering and interaction
- `components/DiagramList.tsx`
  - current document selection
- `components/AppHeader.tsx`
  - workspace actions and settings entry
- `hooks/useDiagramState.ts`
  - current document, engine, format, code persistence
- `hooks/useDiagramRender.ts`
  - render output state and error handling
- `hooks/useSettings.ts`
  - settings persistence
- `hooks/useToast.ts`
  - transient UI feedback

# Safe change process

1. Identify the source of truth for the state you are changing
2. Confirm all downstream consumers of that state
3. Update prop types before updating component calls when possible
4. Keep editor state, render state, and preview state consistent
5. Avoid introducing duplicated state unless necessary

# Project-specific invariants

- `useDiagramState.ts` is the main source of truth for `engine`, `format`, `code`, `diagrams`, and `currentId`
- `useDiagramRender.ts` owns render output and render errors
- `app/page.tsx` is the integration layer between hooks and panels
- `PreviewPanel.tsx` must match the selected output `format`
- Changes to selectors usually require changes in both `EditorPanel.tsx` and `page.tsx`

# Validation checklist

- Changing engine updates sample / rendering expectations correctly
- Changing format updates preview behavior correctly
- Diagram switching restores the right engine / format / code
- Live preview still behaves correctly
- Errors remain user-readable in Chinese
- Run:
  - `npm run lint`
  - `npm run build`
