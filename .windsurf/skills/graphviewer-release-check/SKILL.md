---
name: graphviewer-release-check
description: Perform a safe quality gate for graph-viewer before merge, release, or deployment.
---

# When to use

Use this skill when:

- Preparing a merge or release
- Verifying a larger refactor
- Checking if UI, rendering, and deployment paths still work
- Reviewing whether recent changes affected build or smoke checks

# Project-specific checks

## Static checks

Run these in order:

1. `npm run lint`
2. `npm run format:check`
3. `npm run build`

## Runtime checks

1. Start the app with `npm run dev`
2. Verify the main page loads
3. Verify Mermaid sample rendering
4. Verify Graphviz sample rendering
5. Switch `SVG / PNG / PDF`
6. Verify export actions that should still work
7. Run `npm run test:smoke`

## Files to inspect if something breaks

- `app/page.tsx`
- `components/EditorPanel.tsx`
- `components/PreviewPanel.tsx`
- `hooks/useDiagramState.ts`
- `hooks/useDiagramRender.ts`
- `app/api/render/route.ts`
- `netlify.toml`
- `Dockerfile`
- `docker-compose.yml`

# Release-focused questions

- Did the change alter render behavior?
- Did the change alter engine or format persistence?
- Did the change break preview-only or export-only paths?
- Did the change introduce a dependency on environment variables?
- Did the change require README or deployment note updates?

# Output expectation

When using this skill, produce:

- a short pass/fail summary
- a list of checks executed
- any remaining risk areas
- exact next actions if something fails
