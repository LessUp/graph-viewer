---
name: graphviewer-render-debug
description: Diagnose rendering, preview, export, Kroki, Mermaid, and Graphviz issues in the graph-viewer Next.js project.
---

# When to use

Use this skill when:

- Diagrams fail to render
- Only a specific engine or format fails
- Local rendering and remote Kroki rendering behave differently
- Preview, download, or export results are wrong
- Custom render server settings break the app

# Project map

- `hooks/useDiagramRender.ts`
  - local Mermaid / Graphviz rendering
  - fallback to `/api/render`
  - download behavior
- `app/api/render/route.ts`
  - Kroki proxying
  - timeout, cache, allowlist, error mapping
- `lib/diagramConfig.ts`
  - engine/format definitions
  - local-render support rules
- `components/PreviewPanel.tsx`
  - SVG / PNG / PDF preview logic
- `components/PreviewToolbar.tsx`
  - export entry points
- `lib/exportUtils.ts`
  - SVG / PNG / HTML / Markdown / source export behavior
- `hooks/useSettings.ts`
  - custom Kroki server settings

# Investigation flow

1. Confirm the failing combination:
   - engine
   - format
   - sample code vs user code
   - local render vs remote render
2. Check whether the engine should render locally in `lib/diagramConfig.ts`
3. Trace `renderDiagram` and `downloadDiagram` in `hooks/useDiagramRender.ts`
4. If the problem is remote-only, inspect `app/api/render/route.ts`
5. If the problem is preview-only, inspect `components/PreviewPanel.tsx`
6. If the problem is export-only, inspect `components/PreviewToolbar.tsx` and `lib/exportUtils.ts`

# Common failure patterns

## Local render issues

- Mermaid initialization problems
- Graphviz WASM loading problems
- local-render capability mismatched with `format`

## Remote render issues

- Kroki timeout
- blocked network access
- invalid custom server URL
- allowlist rejection
- unsupported engine / format mapping

## UI issues

- `format` state not passed through editor / preview
- preview component only handling one format branch
- export menu assuming SVG is always available

# Fix guidance

- Prefer fixing the root cause over adding fallback-only logic
- Keep engine, format, preview, and export behavior aligned
- If you change central config in `lib/diagramConfig.ts`, inspect all consumers
- If an API error is user-facing, keep the Chinese error messages clear and specific

# Validation checklist

- Render a Mermaid sample
- Render a Graphviz sample
- Switch `SVG / PNG / PDF`
- Verify preview updates correctly
- Verify export still works
- Run:
  - `npm run lint`
  - `npm run build`
  - `npm run test:smoke`
