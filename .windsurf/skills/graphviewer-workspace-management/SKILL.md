---
name: graphviewer-workspace-management
description: Manage workspace operations — diagram CRUD, import/export, version history, and localStorage persistence.
---

# When to use

Use this skill when:

- Adding, deleting, renaming, or switching diagrams
- Implementing or debugging workspace import/export (JSON files)
- Fixing localStorage persistence issues
- Working with version history (save/restore snapshots)
- Debugging diagram state hydration or migration

# Key files

## State layer

- `hooks/useDiagramState.ts`
  - Core state: `diagrams`, `currentId`, `engine`, `format`, `code`
  - CRUD: `addDiagram`, `deleteDiagram`, `renameDiagram`, `switchDiagram`
  - Persistence: `localStorage` with `hasHydrated` guard
  - Computed: `currentDiagram`, `diagramList`

## Actions

- `hooks/useWorkspaceActions.ts`
  - `exportWorkspace()` — serialize all diagrams to JSON file download
  - `importWorkspace(file)` — parse JSON file, validate, merge into state
  - Error handling with `useToast`
- `hooks/useVersionActions.ts`
  - `saveVersion()` — snapshot current diagram to version history
  - `restoreVersion(id)` — restore a previous snapshot
- `hooks/useVersionHistory.ts`
  - Version snapshot storage and management
  - Per-diagram version lists

## UI

- `components/DiagramList.tsx`
  - Diagram list sidebar with add/delete/rename/switch
  - Active diagram highlighting
- `components/AppHeader.tsx`
  - Workspace-level actions (import/export buttons)
- `components/VersionHistoryPanel.tsx`
  - Version history sidebar, save/restore UI
  - Timestamp display, diff indicator

## Types

- `lib/types.ts`
  - `DiagramDoc`: `{ id, name, engine, format, code, updatedAt }`
  - Any schema changes must maintain backward compatibility

# Data flow

```
AppHeader (import/export)
  └── useWorkspaceActions
        └── useDiagramState (read/write diagrams[])

DiagramList (CRUD)
  └── useDiagramState (add/delete/rename/switch)

VersionHistoryPanel (save/restore)
  ├── useVersionActions
  └── useVersionHistory
        └── useDiagramState (read current, write restored)
```

# Implementation guidelines

## localStorage persistence

- `useDiagramState` auto-persists to `localStorage` on state change
- `hasHydrated` flag prevents SSR/hydration mismatch — always check before rendering persisted data
- Key format: specific to the diagram state store
- Migration: if `DiagramDoc` schema changes, add migration logic in the hydration path

## Import/export

- Export format: JSON with `{ version, diagrams: DiagramDoc[], exportedAt }`
- Import validation: check `version` field, validate each `DiagramDoc` shape
- Import merge strategy: replace all (current behavior) — document if changing
- File type: `.json` with `application/json` MIME type
- Error messages in Chinese via `useToast`

## Version history

- Versions are per-diagram snapshots stored in `useVersionHistory`
- Each version captures `{ engine, format, code, savedAt }`
- Restore replaces current diagram's code/engine/format
- Version list UI shows timestamps and allows restore/delete

# Common issues

## Diagram state lost after reload

- Check `localStorage` key naming — typo or key collision
- Verify `hasHydrated` is set to `true` after hydration
- Check if another component clears `localStorage`

## Import fails silently

- Check JSON parse error handling in `useWorkspaceActions`
- Verify `DiagramDoc` validation logic
- Check `File.text()` mock in tests (JSDOM doesn't support it natively)

## Version restore doesn't update preview

- Restore must go through `useDiagramState.setCode/setEngine/setFormat`
- `useLivePreview` should auto-trigger after state update
- Check if debounce delay is too long for instant feedback

# Validation

- Create, rename, delete diagrams — state persists after reload
- Switch diagrams — editor and preview update correctly
- Export workspace — downloads valid JSON
- Import workspace — replaces diagrams, renders correctly
- Version save — appears in version history panel
- Version restore — code/engine/format match the snapshot
- Run: `npm run test` and `npm run build`
