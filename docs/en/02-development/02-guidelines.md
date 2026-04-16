# Development Guidelines

Coding standards and best practices for GraphViewer.

## Code Style

### TypeScript

- Use strict mode
- Prefer `interface` over `type` for object shapes
- Use explicit return types for exported functions
- Avoid `any` - use `unknown` with type guards

```typescript
// ✅ Good
interface DiagramState {
  engine: string;
  format: 'svg' | 'png' | 'pdf';
  code: string;
}

function useDiagramState(): DiagramState {
  // ...
}

// ❌ Avoid
function useDiagramState(): any {
  // ...
}
```

### React Components

- Use functional components with hooks
- Keep components focused on single responsibility
- Use `useCallback` for event handlers passed to children
- Use `useMemo` for expensive computations

```typescript
// ✅ Good
interface EditorPanelProps {
  engine: string;
  onEngineChange: (engine: string) => void;
}

export function EditorPanel({ engine, onEngineChange }: EditorPanelProps) {
  const handleSelect = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    onEngineChange(e.target.value);
  }, [onEngineChange]);
  
  return <select value={engine} onChange={handleSelect}>...</select>;
}
```

### Hooks

- Prefix custom hooks with `use`
- Hooks should have single responsibility
- Return typed objects, not arrays for multiple values

```typescript
// ✅ Good
interface UseDiagramStateReturn {
  state: DiagramState;
  setEngine: (engine: string) => void;
  setCode: (code: string) => void;
}

export function useDiagramState(): UseDiagramStateReturn {
  // ...
}
```

## File Organization

### Naming Conventions

| Type | Naming | Example |
|------|--------|---------|
| Components | PascalCase | `EditorPanel.tsx` |
| Hooks | camelCase with use prefix | `useDiagramState.ts` |
| Utilities | camelCase | `exportUtils.ts` |
| Types | PascalCase | `DiagramState.ts` |
| Constants | UPPER_SNAKE_CASE | `MAX_CODE_LENGTH` |
| Tests | Same as source + `.test.ts` | `exportUtils.test.ts` |

### Directory Structure

```
lib/
├── diagramConfig.ts       # Configuration
├── diagramSamples.ts      # Sample data
├── exportUtils.ts         # Export utilities
└── types.ts               # Shared types
```

## Testing Standards

### Test File Location

Place tests in `__tests__` directories:

```
lib/
├── __tests__/
│   └── diagramConfig.test.ts
└── diagramConfig.ts
```

### Test Naming

```typescript
// ✅ Good
describe('useDiagramState', () => {
  describe('state persistence', () => {
    it('should save state to localStorage', () => {
      // ...
    });
    
    it('should restore state from localStorage', () => {
      // ...
    });
  });
});
```

### Testing Patterns

```typescript
// Mock external dependencies
vi.mock('lz-string', () => ({
  compressToEncodedURIComponent: vi.fn(),
  decompressFromEncodedURIComponent: vi.fn(),
}));

// Test user interactions
render(<Component />);
await userEvent.click(screen.getByRole('button'));
expect(screen.getByText('Result')).toBeInTheDocument();
```

## Error Handling

### Frontend

```typescript
// ✅ Use try-catch with specific error types
try {
  await renderDiagram(code);
} catch (error) {
  if (error instanceof RenderError) {
    setError(error.message);
  } else {
    setError('Unexpected error occurred');
    console.error(error);
  }
}
```

### API Routes

```typescript
// ✅ Return structured error responses
return NextResponse.json(
  { 
    error: 'KROKI_ERROR',
    message: 'Failed to render diagram',
    details: error.message 
  },
  { status: 502 }
);
```

## Performance Guidelines

### Avoid Unnecessary Renders

```typescript
// ✅ Use memoization
const sortedDiagrams = useMemo(() => 
  diagrams.sort((a, b) => b.updatedAt - a.updatedAt),
  [diagrams]
);

// ✅ Memoize callback props
const handleRender = useCallback(() => {
  renderDiagram(code);
}, [code, renderDiagram]);
```

### Lazy Loading

```typescript
// ✅ Lazy load heavy components
const GraphvizRenderer = dynamic(
  () => import('./GraphvizRenderer'),
  { ssr: false }
);
```

## Documentation

### JSDoc Comments

```typescript
/**
 * Renders a diagram using the specified engine and format.
 * 
 * @param engine - Diagram engine (mermaid, plantuml, etc.)
 * @param format - Output format (svg, png, pdf)
 * @param code - Diagram source code
 * @returns Rendered output and metadata
 * 
 * @example
 * const result = await renderDiagram('mermaid', 'svg', 'graph TD; A-->B;');
 */
export async function renderDiagram(
  engine: string,
  format: Format,
  code: string
): Promise<RenderResult> {
  // ...
}
```

## Security Best Practices

1. **Sanitize user input** before rendering SVG
2. **Validate file uploads** for workspace imports
3. **Use environment variables** for sensitive config
4. **Set security headers** in API routes
5. **Never log sensitive data** (full code content)

## Code Review Checklist

- [ ] TypeScript compiles without errors
- [ ] All tests pass
- [ ] No `console.log` statements (use proper logging)
- [ ] Error handling is comprehensive
- [ ] Accessibility attributes present (`aria-label`, etc.)
- [ ] Performance optimizations applied where needed
- [ ] Documentation updated if API changes
