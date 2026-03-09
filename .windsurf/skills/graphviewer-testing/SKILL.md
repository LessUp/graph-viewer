---
name: graphviewer-testing
description: Write, debug, and maintain Vitest unit tests for GraphViewer hooks, components, and lib modules.
---

# When to use

Use this skill when:

- Writing new unit tests
- Debugging failing tests
- Adding mocks for browser APIs or external dependencies
- Updating tests after refactoring

# Test stack

- **Runner**: Vitest
- **DOM**: jsdom
- **Component testing**: `@testing-library/react`
- **Assertions**: Vitest built-in + `@testing-library/jest-dom`
- **Config**: `vitest.config.ts`, `vitest.setup.ts`

# Test file locations

Follow existing conventions:

- `lib/__tests__/*.test.ts` — pure logic tests
- `hooks/__tests__/*.test.tsx` — hook tests with `renderHook`
- `components/__tests__/*.test.tsx` — component render tests
- `app/**/route.test.ts` — API route tests

# Existing tests

- `lib/__tests__/diagramConfig.test.ts`
- `hooks/__tests__/useDiagramState.test.tsx`
- `components/__tests__/AppHeader.test.tsx`
- `app/api/healthz/route.test.ts`

# Common mocking patterns

## localStorage

```ts
const store: Record<string, string> = {};
vi.stubGlobal('localStorage', {
  getItem: vi.fn((k: string) => store[k] ?? null),
  setItem: vi.fn((k: string, v: string) => {
    store[k] = v;
  }),
  removeItem: vi.fn((k: string) => {
    delete store[k];
  }),
  clear: vi.fn(() => Object.keys(store).forEach((k) => delete store[k])),
});
```

## File.text()

```ts
vi.spyOn(File.prototype, 'text').mockResolvedValue('mock content');
```

## window.history / window.location

```ts
vi.stubGlobal('history', { replaceState: vi.fn() });
```

## fetch (for API route tests)

```ts
global.fetch = vi.fn().mockResolvedValue(new Response('ok'));
```

# Key rules

- Do NOT use Jest syntax (`jest.fn()`, `jest.mock()`) — use `vi.fn()`, `vi.mock()`
- Always clean up mocks: use `afterEach(() => vi.restoreAllMocks())`
- JSDOM quirks: `File.text()`, `URL.createObjectURL`, `navigator.clipboard` need explicit mocks
- Keep `catch` blocks typed as `catch (e: unknown)` with `instanceof Error` narrowing
- Test file naming: `*.test.ts` or `*.test.tsx`

# Validation

- Run all tests: `npm run test`
- Run specific test: `npx vitest run <path>`
- Watch mode: `npx vitest <path>`
- If business code also changed: `npm run lint`
