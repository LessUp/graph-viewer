# GitHub Pages Deployment

Deploy GraphViewer to GitHub Pages as a static site.

## Overview

GitHub Pages deployment uses static export mode, where:
- The application is pre-built as static HTML/CSS/JS
- No server-side API routes are available
- Remote Kroki rendering requires CORS-enabled Kroki instance

## Setup

### 1. Enable GitHub Pages

1. Go to repository Settings → Pages
2. Source: GitHub Actions
3. Workflow: Next.js

### 2. Configure Workflow

The repository includes `.github/workflows/pages.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
      - run: npm ci
      - run: npm run build:static
      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./out

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/deploy-pages@v4
        id: deployment
```

### 3. Build Configuration

Static export is configured in `next.config.js`:

```javascript
const nextConfig = {
  output: 'export',
  distDir: 'out',
  // ... other config
};
```

## Build Process

```bash
# Local static build
npm run build:static

# Output in out/ directory
# Upload out/ to GitHub Pages
```

The build script (`scripts/build-static-export.mjs`) handles:
1. Setting environment variables for static build
2. Running Next.js export
3. Copying necessary assets

## Limitations

### API Routes

The following features are **unavailable** in static mode:

- `/api/render` - Kroki proxy (requires server)
- Server-side caching
- Environment variable injection at runtime

### Remote Rendering

For remote engines (PlantUML, D2, etc.), you need:

1. **CORS-enabled Kroki**: The Kroki instance must allow cross-origin requests
2. **Public Kroki**: `https://kroki.io` works (if accessible)
3. **Self-hosted Kroki**: Deploy with appropriate CORS headers

### Local Rendering

Local rendering still works in static mode:
- ✅ Mermaid (browser)
- ✅ Graphviz WASM (browser)
- ❌ Remote engines without CORS

## Configuration for Static Mode

### Client-Side Kroki

Users can configure a custom Kroki URL in the Settings panel:

1. Open Settings (gear icon)
2. Enable "Custom Render Server"
3. Enter Kroki URL: `https://your-kroki-instance.com`

### Environment Variables

Static builds embed environment variables at build time:

```env
# .env.production
NEXT_PUBLIC_DEFAULT_KROKI_URL=https://kroki.io
```

## Verification

### Local Preview

```bash
npm run build:static
npx serve out
```

Open `http://localhost:3000` and verify:
- [ ] Mermaid diagrams render
- [ ] Graphviz diagrams render (WASM)
- [ ] Settings panel opens
- [ ] Export functions work

### Post-Deployment

After GitHub Actions deploys:

1. Visit your Pages URL
2. Test local rendering (Mermaid)
3. If using remote Kroki, test PlantUML/D2
4. Verify all export formats

## Custom Domain

### Setup

1. Add `CNAME` file to repository root:
   ```
   diagrams.example.com
   ```

2. Configure DNS:
   - CNAME record pointing to `<username>.github.io`
   - Or A records for apex domain

3. Update repository Settings → Pages → Custom domain

### HTTPS

GitHub Pages automatically provisions SSL certificates for custom domains.

## Troubleshooting

### Build Failures

Check GitHub Actions logs for:
- Node.js version compatibility
- npm install errors
- TypeScript compilation errors

### Runtime Errors

Open browser DevTools:
- Console errors
- Network requests to Kroki
- 404 errors for assets

### CORS Errors

If remote rendering fails:
```
Access to fetch at 'https://kroki.io/' from origin '...' has been blocked by CORS policy
```

Solutions:
1. Use local Kroki with CORS headers
2. Use a CORS proxy
3. Stick to local rendering engines

## Best Practices

1. **Test locally** before pushing: `npm run build:static`
2. **Document limitations** for users
3. **Provide Kroki options** in Settings
4. **Monitor GitHub Actions** for build status
