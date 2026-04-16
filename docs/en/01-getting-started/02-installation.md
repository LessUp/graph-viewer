# Installation Guide

Complete installation instructions for GraphViewer.

## System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| Node.js | 20.0.0 | 22.0.0 LTS |
| npm | 10.0.0 | 11.6.0+ |
| RAM | 4GB | 8GB |
| Disk | 1GB free | 2GB free |

## Standard Installation

### Step 1: Clone Repository

```bash
git clone https://github.com/LessUp/graph-viewer.git
cd graph-viewer
```

### Step 2: Install Dependencies

```bash
npm install
```

This installs all required dependencies including:
- Next.js 15 framework
- React 19 and React DOM
- Mermaid, Graphviz WASM, and other rendering engines
- CodeMirror editor components
- Testing utilities (Vitest, Testing Library)

### Step 3: Environment Configuration (Optional)

Create a `.env.local` file for local development:

```env
# Kroki remote rendering service (default: https://kroki.io)
KROKI_BASE_URL=https://kroki.io

# Server port (default: 3000)
PORT=3000

# Graphviz WASM base URL (uses CDN by default)
NEXT_PUBLIC_GRAPHVIZ_WASM_BASE_URL=https://unpkg.com/@hpcc-js/wasm/dist
```

### Step 4: Verify Installation

Run the development server:

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

## Production Build

### Build with API Routes

For deployments with server-side rendering:

```bash
npm run build
npm start
```

### Static Export

For GitHub Pages or static hosting:

```bash
npm run build:static
```

Output will be in `dist/` directory.

## Docker Installation

### Using Docker Compose

```bash
# Production with self-hosted Kroki
docker compose --profile prod --profile kroki up -d

# Development
docker compose --profile dev up
```

### Using Docker Directly

```bash
# Build image
docker build -t graph-viewer .

# Run container
docker run -p 3000:3000 -e KROKI_BASE_URL=https://kroki.io graph-viewer
```

## Troubleshooting

### Port Already in Use

```bash
# Use a different port
npm run dev -- -p 3001
```

### Permission Errors (Linux/macOS)

```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
```

### Node.js Version Mismatch

Use Node Version Manager:

```bash
# nvm
nvm install 22
nvm use 22

# fnm
fnm install 22
fnm use 22
```
