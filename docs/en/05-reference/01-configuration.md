# Configuration Reference

Complete reference for GraphViewer configuration options.

## Environment Variables

### Server Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server listening port |
| `NODE_ENV` | `development` | Environment mode |
| `KROKI_BASE_URL` | `https://kroki.io` | Default Kroki rendering service |
| `KROKI_TIMEOUT_MS` | `10000` | Kroki request timeout (ms) |
| `KROKI_ALLOW_CLIENT_BASE_URL` | `false` | Allow clients to specify Kroki URL |
| `KROKI_CLIENT_BASE_URL_ALLOWLIST` | - | Comma-separated allowed URLs |

### Client-Side Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_GRAPHVIZ_WASM_BASE_URL` | CDN URL | Graphviz WASM resource URL |
| `NEXT_PUBLIC_DEFAULT_KROKI_URL` | - | Default Kroki for client config |

### AI Assistant Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `AI_API_KEY` | - | API key for AI service |
| `AI_BASE_URL` | - | Custom AI service endpoint |
| `AI_MODEL` | `gpt-4` | AI model selection |

## Complete .env.example

```env
# ================================================
# GraphViewer Environment Configuration
# ================================================

# Server Configuration
# --------------------
PORT=3000
NODE_ENV=production

# Kroki Configuration
# -------------------
# Default Kroki service for server-side rendering
KROKI_BASE_URL=https://kroki.io

# Request timeout (milliseconds)
KROKI_TIMEOUT_MS=10000

# Client Kroki Configuration
# --------------------------
# Uncomment to allow clients to specify their own Kroki URL
# KROKI_ALLOW_CLIENT_BASE_URL=true

# Or restrict to specific URLs (comma-separated)
# KROKI_CLIENT_BASE_URL_ALLOWLIST=https://kroki.example.com,https://kroki.internal:8000

# Graphviz WASM
# -------------
# CDN for Graphviz WASM files
NEXT_PUBLIC_GRAPHVIZ_WASM_BASE_URL=https://unpkg.com/@hpcc-js/wasm/dist

# AI Assistant (Optional)
# -----------------------
# AI_API_KEY=sk-...
# AI_BASE_URL=https://api.openai.com/v1
# AI_MODEL=gpt-4
```

## Next.js Configuration

### Static Export

For GitHub Pages deployment:

```javascript
// next.config.js
const nextConfig = {
  output: 'export',
  distDir: 'dist',
  images: {
    unoptimized: true, // Required for static export
  },
};
```

### Standalone Output

For Docker deployment:

```javascript
// next.config.js
const nextConfig = {
  output: 'standalone',
};
```

### Custom Webpack

```javascript
// next.config.js
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        path: false,
      };
    }
    return config;
  },
};
```

## Docker Configuration

### docker-compose.yml

```yaml
services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - KROKI_BASE_URL=${KROKI_BASE_URL:-https://kroki.io}
      - PORT=3000
    depends_on:
      - kroki
    profiles:
      - prod

  kroki:
    image: yuzutech/kroki:latest
    ports:
      - "8000:8000"
    profiles:
      - kroki
```

### Dockerfile

```dockerfile
FROM node:22-alpine AS base

# Dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
```

## TypeScript Configuration

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

## ESLint Configuration

### .eslintrc.json

```json
{
  "extends": [
    "next/core-web-vitals",
    "next/typescript",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

## Prettier Configuration

### .prettierrc.json

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

## Tailwind Configuration

### tailwind.config.js

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
};
```

## Vitest Configuration

### vitest.config.ts

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
```

## Runtime Constants

### Code Limits

| Limit | Value | Description |
|-------|-------|-------------|
| `MAX_CODE_LENGTH` | 100,000 | Maximum characters per diagram |
| `MAX_DIAGRAMS` | 100 | Maximum diagrams in workspace |

### Cache Configuration

| Setting | Value | Description |
|---------|-------|-------------|
| `CACHE_MAX_AGE_MS` | 3,600,000 | Cache entry TTL (1 hour) |
| `CACHE_SIZE_LIMIT` | 1,000 | Maximum cache entries |

### Debounce Timing

| Setting | Value | Description |
|---------|-------|-------------|
| `PREVIEW_DEBOUNCE_MS` | 300 | Input debounce for preview |

### Export Settings

| Setting | Value | Description |
|---------|-------|-------------|
| `PNG_QUALITY` | 0.95 | PNG export quality (0-1) |
| `PNG_SCALE_2X` | 2 | 2x PNG scale factor |
| `PNG_SCALE_4X` | 4 | 4x PNG scale factor |
| `SVG_PADDING` | 20 | SVG viewBox padding (px) |
