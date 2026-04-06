# GraphViewer

English | [简体中文](README.zh-CN.md)

An all-in-one diagram visualization tool supporting 16 diagram engines including Mermaid, PlantUML, Graphviz, D2, Nomnoml, Ditaa, BlockDiag, NwDiag, ActDiag, SeqDiag, ERD, SVGBob, WaveDrom, Vega, and Vega-Lite. Features local and server-side hybrid rendering, containerized deployment, and automated testing.

## Highlights

- Local Graphviz WASM rendering (SVG) and Mermaid local rendering for faster response
- Server-side rendering result caching to reduce latency
- Containerized deployment (multi-stage build, health checks), supporting dev/test/prod
- One-click deploy scripts and health probes
- Automated smoke tests and performance benchmarks

## Quick Start

```bash
npm install
npm run dev
# Open http://localhost:3000
```

### Type Check & Test

```bash
npm run typecheck
npm test
npx vitest run path/to/file.test.ts
npm run lint
npm run format
```

## Share Links

- Share links store `engine`, `format`, and compressed `code` in the URL query string.
- Code is compressed with `lz-string` via `compressToEncodedURIComponent`, then restored with `decompressFromEncodedURIComponent`.
- This reduces URL length significantly, but browser / chat tool / proxy limits still apply. Large diagrams can still produce links that are too long to paste reliably.
- If compressed content cannot be decoded, the app falls back to the raw query value and shows a friendly warning.

## Live Preview

- Live preview is debounced and intended for small to medium diagrams.
- For large diagrams or slower remote renderers, disable live preview and use manual render (`Ctrl+Enter`) to avoid unnecessary requests.
- Source export is available with `Ctrl+S` inside the editor.

## Code Style

- Run `npm run lint` before submitting changes.
- Run `npm run format` to normalize formatting.
- Prefer small edits to the existing state / render / action hook layers instead of adding parallel flows.

## Deployment

### Local docker-compose flow

- Dev: `docker compose --profile dev up --build`
- Test: `docker compose --profile test up --build`
- Prod: `docker compose --profile prod up --build -d`
- Smoke test after startup: `npm run test:smoke`

### Service deployment

- **Environment Variables**: `KROKI_BASE_URL` (default `https://kroki.io`), `PORT` (default `3000`)
- **Docker**: `docker compose --profile prod build && docker compose --profile prod up -d`
- **Deploy Script**: `ENV=prod ./scripts/deploy.sh`
- **Health Check**: `curl -fsS http://localhost:3000/api/healthz`

### Deployment modes

- **Full-service mode**: default `npm run build`, includes `/api/render` and `/api/healthz`.
- **Static export mode**: `npm run build:static`, used for GitHub Pages.
  - Remote rendering is unavailable in this mode.
  - Only local SVG rendering paths remain available.
  - The build no longer deletes `app/api`; instead the app detects static mode explicitly.

## Architecture

- **Frontend**: `app/page.tsx` + `components/*` + `hooks/*` — editing, preview, state persistence
- **Backend**: `/api/render` as Kroki proxy & cache, `/api/healthz` for health checks
- **Config**: `lib/diagramConfig.ts` for engine/format management, `lib/diagramSamples.ts` for samples

## Security

- **Local Rendering**: Mermaid uses `securityLevel: 'strict'`; Graphviz WASM runs in-browser
- **Remote Rendering**: `/api/render` forwards to Kroki instance with short-term memory cache
- **Recommendation**: Use local rendering for sensitive content, or self-hosted Kroki

## Testing & Benchmarks

```bash
npm test              # Unit tests
npm run typecheck     # Type check
npm run test:smoke    # Smoke tests
npm run bench         # Performance benchmarks
```

## License

MIT
