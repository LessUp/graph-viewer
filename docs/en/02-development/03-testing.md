# Testing Guide

Comprehensive testing strategies for GraphViewer.

## Testing Layers

GraphViewer has three testing layers:

1. **Unit/Component Tests** - Vitest + Testing Library
2. **API Smoke Tests** - Node.js scripts
3. **Manual Regression** - Browser-based testing

## Unit and Component Tests

### Running Tests

```bash
# Run all tests once
npm run test

# Watch mode for development
npm run test:watch

# Run with coverage report
npm run test -- --coverage

# Run specific test file
npm run test -- useDiagramState.test.tsx
```

### Current Test Coverage

| Module                  | Test File                                    | Coverage                 |
| ----------------------- | -------------------------------------------- | ------------------------ |
| lib/diagramConfig       | `lib/__tests__/diagramConfig.test.ts`        | Engine/format validation |
| hooks/useDiagramState   | `hooks/__tests__/useDiagramState.test.tsx`   | State persistence        |
| hooks/useDiagramRender  | `hooks/__tests__/useDiagramRender.test.tsx`  | Rendering logic          |
| hooks/useVersionHistory | `hooks/__tests__/useVersionHistory.test.tsx` | Version management       |
| components/AppHeader    | `components/__tests__/AppHeader.test.tsx`    | Import/export            |
| components/PreviewPanel | `components/__tests__/PreviewPanel.test.tsx` | Preview display          |
| API /healthz            | `app/api/healthz/route.test.ts`              | Health check             |
| API /render             | `app/api/render/route.test.ts`               | Rendering endpoint       |

### Writing Tests

#### Testing Hooks

```typescript
import { renderHook, act } from '@testing-library/react';
import { useDiagramState } from './useDiagramState';

describe('useDiagramState', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should persist state to localStorage', () => {
    const { result } = renderHook(() => useDiagramState());

    act(() => {
      result.current.setCode('graph TD; A-->B;');
    });

    const saved = localStorage.getItem('graphviewer:state:v1');
    expect(saved).toContain('graph TD');
  });
});
```

#### Testing Components

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { EditorPanel } from './EditorPanel';

describe('EditorPanel', () => {
  it('should render engine selector', () => {
    render(<EditorPanel engine="mermaid" onEngineChange={vi.fn()} code="" />);

    expect(screen.getByLabelText(/engine/i)).toBeInTheDocument();
  });

  it('should call onEngineChange when engine selected', () => {
    const onChange = vi.fn();
    render(<EditorPanel engine="mermaid" onEngineChange={onChange} code="" />);

    fireEvent.change(screen.getByLabelText(/engine/i), {
      target: { value: 'plantuml' }
    });

    expect(onChange).toHaveBeenCalledWith('plantuml');
  });
});
```

#### Testing API Routes

```typescript
import { POST } from './route';

describe('/api/render', () => {
  it('should return 400 for invalid engine', async () => {
    const request = new Request('http://localhost/api/render', {
      method: 'POST',
      body: JSON.stringify({ engine: 'invalid', format: 'svg', code: 'test' }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('should return cached result for identical requests', async () => {
    // First request
    const req1 = createRequest({ engine: 'mermaid', format: 'svg', code: 'A-->B;' });
    await POST(req1);

    // Second identical request should hit cache
    const req2 = createRequest({ engine: 'mermaid', format: 'svg', code: 'A-->B;' });
    const response2 = await POST(req2);

    expect(response2.headers.get('X-Cache')).toBe('HIT');
  });
});
```

### Mocking Dependencies

```typescript
// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(),
    write: vi.fn(),
  },
});

// Mock fetch for API tests
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ result: 'success' }),
  }),
);
```

## Smoke Testing

### Running Smoke Tests

```bash
# Start dev server first
npm run dev

# Run smoke tests against localhost
npm run test:smoke

# Test specific endpoint
node scripts/smoke-test.js http://localhost:3000
```

### Smoke Test Coverage

Current smoke tests verify:

- `GET /api/healthz` - Health check endpoint
- `POST /api/render` - Mermaid SVG rendering
- `POST /api/render` - Mermaid PNG rendering

### Expected Output

```
✅ Health check: 200 OK
✅ Render Mermaid SVG: 200 OK
✅ Render Mermaid PNG: 200 OK

All smoke tests passed!
```

## Integration Testing

### Docker Compose Testing

```bash
# Start full stack
docker compose --profile prod --profile kroki up -d

# Run smoke tests against container
npm run test:smoke http://localhost:3000

# Clean up
docker compose down
```

### Share Link Testing

1. Create a diagram
2. Click "Share" button
3. Copy the generated URL
4. Open in incognito window
5. Verify state is restored correctly

## Manual Regression Checklist

### Rendering Tests

- [ ] Mermaid diagram renders (local)
- [ ] Graphviz diagram renders (local WASM)
- [ ] PlantUML diagram renders (remote)
- [ ] D2 diagram renders (remote)
- [ ] All other engines render correctly

### Export Tests

- [ ] Export SVG downloads valid file
- [ ] Export PNG 2x downloads valid image
- [ ] Export PNG 4x downloads valid image
- [ ] Export HTML downloads standalone page
- [ ] Export Markdown downloads .md file
- [ ] Copy PNG to clipboard works

### Workspace Tests

- [ ] Create new diagram
- [ ] Rename diagram
- [ ] Delete diagram
- [ ] Import workspace JSON
- [ ] Export workspace JSON
- [ ] localStorage persistence across reloads

### Settings Tests

- [ ] Custom Kroki server (when allowed)
- [ ] Theme switching
- [ ] Keyboard shortcuts work

## Continuous Integration

Tests run automatically on:

- Push to main branch
- Pull request creation
- Nightly scheduled runs

### CI Test Matrix

| Environment   | Node Version | Test Suite                   |
| ------------- | ------------ | ---------------------------- |
| ubuntu-latest | 22.x         | Full test suite              |
| CI workflow   | 22.x         | Lint, typecheck, test, build |

## Debugging Test Failures

### Common Issues

**Test timeout:**

```bash
# Increase timeout for slow tests
npm run test -- --testTimeout=10000
```

**Environment mismatch:**

```bash
# Clear Jest/Vitest cache
npm run test -- --clearCache
```

**Missing mocks:**

- Check that all browser APIs are mocked
- Verify fetch mocks return proper Response objects

### Test Utilities

The project includes test utilities in `vitest.setup.ts`:

- `jsdom` environment setup
- Mermaid mock for server-side testing
- localStorage mock
- Clipboard API mock
