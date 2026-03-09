---
name: graphviewer-performance-audit
description: Audit and optimize GraphViewer performance — bundle size, render speed, React re-renders, and API latency.
---

# When to use

Use this skill when:

- Bundle size grows unexpectedly
- Diagrams render slowly or cause UI jank
- React components re-render too frequently
- API render requests are slow or timing out
- Investigating memory leaks or high memory usage

# Key performance areas

## 1. Bundle size

### Analysis tools

```bash
# Next.js build with bundle analysis
ANALYZE=true npm run build

# Check bundle size manually
npx next build
# Review .next/analyze/ output
```

### Key heavy dependencies

| Package | Approx. size | Notes |
|---------|-------------|-------|
| `mermaid` | ~2MB | Dynamic import only in `useDiagramRender` |
| `@hpcc-js/wasm` | ~4MB WASM | Dynamic import only for Graphviz |
| `@uiw/react-codemirror` | ~500KB | Tree-shakeable, check extensions |
| `html2canvas` | ~200KB | Used only for PNG export |
| `dompurify` | ~50KB | Required for SVG sanitization |

### Optimization targets

- `lib/diagramConfig.ts` — static config, should be in main bundle
- `lib/diagramSamples.ts` — can be lazy-loaded per engine
- `hooks/useDiagramRender.ts` — Mermaid/Graphviz imports must be dynamic
- `components/AIAssistantPanel.tsx` — can be lazy-loaded (sidebar panel)
- `components/SettingsModal.tsx` — can be lazy-loaded (modal)

## 2. Render performance

### Critical render path

```
User types code
  → useLivePreview (debounce)
    → useDiagramRender.renderDiagram()
      → local (Mermaid/Graphviz WASM) or remote (/api/render → Kroki)
        → PreviewPanel (DOM update)
```

### Investigation steps

1. Check `useSettings().debounceMs` — too low causes excessive renders
2. Check `useDiagramRender` for redundant calls with same input
3. Profile Mermaid initialization time (first render is slower)
4. Check if Graphviz WASM is being reloaded on each render
5. Check API render cache hit rate in `app/api/render/route.ts`

## 3. React re-render optimization

### Hot components

- `PreviewPanel` — re-renders on every render result change
- `EditorPanel` — re-renders on engine/format/code changes
- `CodeEditor` — re-renders on code or settings changes
- `DiagramList` — re-renders on diagram list changes

### Diagnosis

1. Use React DevTools Profiler to identify unnecessary re-renders
2. Check if `page.tsx` passes inline objects/functions as props
3. Verify callback props come from hooks (stable references) not inline arrows
4. Check if `useDiagramState` returns new object references unnecessarily

## 4. API render latency

### Server-side checks

- Cache hit rate: check `renderCache` in `app/api/render/route.ts`
- In-flight dedup: check `inFlightRequests` map
- Kroki response time: check `KROKI_TIMEOUT_MS` (10s default)
- Code size: check against `MAX_CODE_LENGTH` (100KB)

### Network optimization

- Verify Kroki server proximity (public vs self-hosted)
- Check if gzip compression is enabled in `next.config.js`
- Check if unnecessary headers are being sent

# Benchmarking

## Built-in benchmark

```bash
npm run bench
# Runs scripts/bench.js
```

## Manual render timing

```javascript
// In browser console
const start = performance.now();
// Trigger render
const end = performance.now();
console.log(`Render: ${end - start}ms`);
```

# Validation

After optimization:

1. `npm run build` — check output size report
2. `npm run test` — no regressions
3. Manual test: type rapidly in editor, preview should stay responsive
4. Manual test: switch engines, first render time should be < 2s
5. Manual test: export PNG/PDF, should complete in < 5s
