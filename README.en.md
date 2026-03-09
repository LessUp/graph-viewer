# GraphViewer

[简体中文](README.md) | English

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
```

## Deployment

- **Environment Variables**: `KROKI_BASE_URL` (default `https://kroki.io`), `PORT` (default `3000`)
- **Docker**: `docker compose --profile prod build && docker compose --profile prod up -d`
- **Deploy Script**: `ENV=prod ./scripts/deploy.sh`
- **Health Check**: `curl -fsS http://localhost:3000/api/healthz`

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
