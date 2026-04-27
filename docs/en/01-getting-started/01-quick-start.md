# Quick Start & Installation

Get GraphViewer up and running in under 5 minutes.

## Prerequisites

| Component | Minimum | Recommended |
| --------- | ------- | ----------- |
| Node.js   | 20.0.0  | 22.0.0 LTS  |
| npm       | 10.0.0  | 11.6.0+     |
| Git       | Any     | Latest      |

Verify your environment:

```bash
node --version  # v20.0.0 or higher
npm --version   # 10.0.0 or higher
```

## Quick Install

```bash
# Clone repository
git clone https://github.com/LessUp/graph-viewer.git
cd graph-viewer

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`.

## Environment Variables (Optional)

Create `.env.local` for local development:

```env
KROKI_BASE_URL=https://kroki.io
PORT=3000
```

## Production Build

```bash
# Standard build (with API routes)
npm run build
npm start

# Static export (for GitHub Pages)
npm run build:static
```

## Docker

```bash
# Production with self-hosted Kroki
docker compose --profile prod --profile kroki up -d

# Development
docker compose --profile dev up
```

## First Steps

1. **Create Your First Diagram** - Select an engine, choose a sample, click "Render Preview"
2. **Export** - Choose from SVG, PNG (2x/4x), HTML, or Markdown formats
3. **Share** - Generate a compressed URL for easy sharing

## Next Steps

- Learn about [supported diagram engines](../04-features/02-rendering.md)
- Explore [export options](../04-features/01-export.md)
- Read the [architecture overview](./03-architecture.md)
