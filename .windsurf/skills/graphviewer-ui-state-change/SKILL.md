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
- Modifying sidebar tabs, collapsed sidebar, or settings modal

# Key files

## Page & layout

- `app/page.tsx` — top-level composition, panel switching, hook orchestration
- `app/layout.tsx` — root layout, metadata, global styles

## Components

- `components/EditorPanel.tsx` — engine / format selector, render actions, editor controls
- `components/CodeEditor.tsx` — CodeMirror editor wrapper
- `components/PreviewPanel.tsx` — preview rendering and interaction
- `components/PreviewToolbar.tsx` — export entry points, share link
- `components/DiagramList.tsx` — current document selection
- `components/AppHeader.tsx` — workspace actions and settings entry
- `components/SidebarTabs.tsx` — sidebar tab switching
- `components/CollapsedSidebar.tsx` — collapsed sidebar icon bar
- `components/SettingsModal.tsx` — settings dialog (Kroki URL, debounce, font size)
- `components/VersionHistoryPanel.tsx` — version history sidebar
- `components/AIAssistantPanel.tsx` — AI assistant sidebar
- `components/Toast.tsx` — toast notification display
- `components/ErrorBoundary.tsx` — React error boundary

## Hooks (state sources of truth)

- `hooks/useDiagramState.ts` — diagrams, currentId, engine, format, code persistence; exposes `hasHydrated`
- `hooks/useDiagramRender.ts` — render output, errors, `renderDiagram` / `downloadDiagram`
- `hooks/useLivePreview.ts` — debounced live preview triggering
- `hooks/useSettings.ts` — settings persistence (Kroki URL, debounce, font size)
- `hooks/useToast.ts` — transient UI feedback
- `hooks/useVersionHistory.ts` — version snapshot management
- `hooks/useVersionActions.ts` — version save / restore actions
- `hooks/useWorkspaceActions.ts` — workspace import / export
- `hooks/useAIAssistant.ts` — AI assistant state
- `hooks/useAIActions.ts` — AI action handlers

## Types

- `lib/types.ts` — shared type definitions

# Safe change process

1. Identify the source of truth for the state you are changing
2. Confirm all downstream consumers of that state
3. Update prop types before updating component calls when possible
4. Keep editor state, render state, and preview state consistent
5. Avoid introducing duplicated state unless necessary
6. Check `hasHydrated` guard if touching initialization logic

# Project-specific invariants

- `useDiagramState.ts` is the main source of truth for `engine`, `format`, `code`, `diagrams`, and `currentId`
- `useDiagramRender.ts` owns render output and render errors
- `app/page.tsx` is the integration layer between hooks and panels
- `PreviewPanel.tsx` must match the selected output `format`
- Changes to selectors usually require changes in both `EditorPanel.tsx` and `page.tsx`
- Sidebar state (tabs, collapsed) is managed in `page.tsx`
- Settings flow: `SettingsModal.tsx` ↔ `useSettings.ts` → consumers (`useLivePreview`, `CodeEditor`)

# Validation checklist

- Changing engine updates sample / rendering expectations correctly
- Changing format updates preview behavior correctly
- Diagram switching restores the right engine / format / code
- Live preview still behaves correctly
- Sidebar tabs and collapsed state work correctly
- Settings modal changes propagate to all consumers
- Errors remain user-readable in Chinese
- Run:
  - `npm run lint`
  - `npm run build`
