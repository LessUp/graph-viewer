---
name: graphviewer-deploy
description: Deploy GraphViewer via Docker or Netlify, troubleshoot build and deployment issues.
---

# When to use

Use this skill when:

- Deploying to Netlify or Docker
- Debugging build failures
- Updating deployment configuration
- Modifying environment variables or runtime settings

# Deployment targets

## Netlify (production)

- Config: `netlify.toml`
- Framework: Next.js (auto-detected)
- Build command: `npm run build`
- Health check: `/api/healthz`

## Docker (self-hosted / intranet)

- `Dockerfile` — multi-stage build (deps → build → runtime)
- `docker-compose.yml` — service definition with env vars
- Health check: `/api/healthz`

# Key files

- `netlify.toml` — Netlify build settings, redirects, headers
- `Dockerfile` — Docker image build steps
- `docker-compose.yml` — compose service definition
- `next.config.js` — Next.js build configuration
- `app/api/healthz/route.ts` — health check endpoint
- `app/api/render/route.ts` — render API (Kroki proxy)
- `scripts/deploy.sh` — deployment helper script
- `scripts/smoke-test.js` — post-deploy smoke test
- `.env.example` — environment variable template

# Environment variables

- `KROKI_SERVER` — custom Kroki server URL (default: public Kroki)
- `NODE_ENV` — production / development

# Pre-deploy checklist

1. `npm run lint` — no lint errors
2. `npm run build` — clean build
3. `npm run test` — all tests pass
4. `npm run test:smoke` — smoke tests pass
5. Verify `.env.example` is up to date if new env vars were added
6. Check `netlify.toml` if build settings changed
7. Check `Dockerfile` if dependencies changed

# Common issues

## Netlify build fails

- Check Node.js version in `netlify.toml`
- Check if new dependencies were added to `package.json`
- Verify `next.config.js` for SSR/edge compatibility

## Docker build fails

- Check multi-stage COPY paths in `Dockerfile`
- Verify `package-lock.json` is committed
- Check base image Node.js version

## Runtime errors after deploy

- Check `/api/healthz` endpoint
- Check browser console for hydration mismatches
- Verify environment variables are set correctly

# Validation

After deployment:

1. Hit `/api/healthz` — should return 200
2. Load main page — should render without errors
3. Render a Mermaid diagram — verify Kroki connectivity
4. Run `node scripts/smoke-test.js <deployed-url>`
