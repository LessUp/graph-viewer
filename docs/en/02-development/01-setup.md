# Development Setup

Configure your environment for GraphViewer development.

## Prerequisites

- Node.js 20+ with npm 10+
- Git
- IDE with TypeScript support (VS Code recommended)

## IDE Configuration

### VS Code Recommended Settings

Create `.vscode/settings.json`:

```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "tailwindCSS.includeLanguages": {
    "typescript": "javascript",
    "typescriptreact": "javascript"
  }
}
```

### Required Extensions

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript Importer

## Development Workflow

### 1. Fork and Clone

```bash
git clone https://github.com/YOUR_USERNAME/graph-viewer.git
cd graph-viewer
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development

```bash
# Start dev server
npm run dev

# In another terminal, run tests in watch mode
npm run test:watch
```

### 4. Make Changes

- Edit code in `app/`, `components/`, `hooks/`, or `lib/`
- Tests auto-run with `npm run test:watch`
- Prettier formats on save
- ESLint highlights issues

### 5. Before Committing

```bash
# Run all quality checks
npm run lint
npm run typecheck
npm run test
npm run build
```

## Environment Variables

### Development

Create `.env.local` for local overrides:

```env
# Use local Kroki for testing
KROKI_BASE_URL=http://localhost:8000

# Debug logging
DEBUG=graph-viewer:*
```

### Testing

```env
# Test-specific Kroki instance
KROKI_BASE_URL=http://localhost:8001
```

## Git Workflow

### Branch Naming

- `feat/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation
- `refactor/description` - Code refactoring

### Commit Messages

Follow conventional commits:

```
feat: add PDF export support
fix: resolve memory leak in preview panel
docs: update installation guide
refactor: simplify diagram state hook
test: add unit tests for export utils
```

## Debugging

### Browser DevTools

1. **React Developer Tools**: Inspect component tree
2. **Network Tab**: Monitor `/api/render` requests
3. **Performance Tab**: Profile render performance

### VS Code Debugging

Launch configuration (`.vscode/launch.json`):

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug full stack",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "console": "integratedTerminal"
    }
  ]
}
```

### Server-Side Debugging

```bash
# Debug API routes
NODE_OPTIONS='--inspect' npm run dev
```

Then attach Chrome DevTools to `chrome://inspect`.

## Testing During Development

### Unit Tests

```bash
# Watch mode
npm run test:watch

# Single run with coverage
npm run test -- --coverage
```

### Integration Tests

```bash
# Start dev server first
npm run dev

# Run smoke tests
npm run test:smoke
```

### Manual Testing Checklist

- [ ] All diagram engines render correctly
- [ ] Export formats work (SVG, PNG, HTML, Markdown)
- [ ] Share links restore correctly
- [ ] localStorage persistence works
- [ ] Responsive layout on different screen sizes

## Common Issues

### Hot Reload Not Working

```bash
# Restart dev server
Ctrl+C && npm run dev
```

### Port Conflicts

```bash
# Find process using port 3000
lsof -i :3000

# Kill process or use different port
npm run dev -- -p 3001
```

### TypeScript Errors

```bash
# Restart TypeScript service in VS Code
Cmd+Shift+P → "TypeScript: Restart TS Server"
```
