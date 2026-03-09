---
name: graphviewer-code-review
description: Perform structured code review for GraphViewer pull requests and changesets.
---

# When to use

Use this skill when:

- Reviewing a pull request or changeset
- Checking code quality before merge
- Auditing recent changes for correctness and style compliance
- Verifying a refactor hasn't broken existing behavior

# Review checklist

## 1. Type safety

- [ ] No `any` types — use `unknown` with narrowing
- [ ] `Engine` and `Format` types from `lib/diagramConfig.ts`, no magic strings
- [ ] `DiagramDoc` shape unchanged or backward-compatible
- [ ] `catch` blocks use `catch (e: unknown)` + `instanceof Error`
- [ ] No `@ts-ignore` or `@ts-expect-error` without clear justification

## 2. Architecture compliance

- [ ] No new global state stores — reuse `useDiagramState`, `useSettings`, `useToast`
- [ ] No duplicate render/export logic — reuse `useDiagramRender`, `lib/exportUtils.ts`
- [ ] `'use client'` only where needed (hooks, browser APIs, event handlers)
- [ ] `lib/` modules remain pure (no `'use client'`, no browser API)
- [ ] API routes use `runtime = 'nodejs'`, `dynamic = 'force-dynamic'`

## 3. Security

- [ ] SVG output sanitized through `dompurify` before DOM injection
- [ ] No `dangerouslySetInnerHTML` with unsanitized content
- [ ] API input validated (engine allowlist, code length limit)
- [ ] No hardcoded secrets or API keys
- [ ] Error responses don't leak internal details

## 4. Performance

- [ ] Heavy imports (`mermaid`, `@hpcc-js/wasm`) use dynamic `import()`
- [ ] No inline object/array literals as props in render functions
- [ ] Callback props from hooks or `useCallback`, not inline arrows
- [ ] No blocking synchronous operations in render path

## 5. UI/UX

- [ ] UI text in Chinese, consistent with existing interface
- [ ] Error messages user-readable, not technical stack traces
- [ ] Interactive elements keyboard-accessible
- [ ] Loading states visible during async operations

## 6. Testing

- [ ] New logic has corresponding tests
- [ ] Tests use Vitest syntax (`vi.fn()`, `vi.mock()`), not Jest
- [ ] Browser APIs mocked (`localStorage`, `File.text()`, etc.)
- [ ] `afterEach(() => vi.restoreAllMocks())` present
- [ ] Tests pass: `npm run test`

## 7. Documentation sync

- [ ] `README.md` updated if user-facing changes
- [ ] `CHANGELOG.md` updated for significant changes
- [ ] `.env.example` updated if new env vars added
- [ ] `.windsurf/` references still valid

# Engine/format change additional checks

If the changeset modifies engines, formats, or rendering:

- [ ] `lib/diagramConfig.ts` — type, category, Kroki mapping
- [ ] `lib/diagramSamples.ts` — sample code
- [ ] `lib/syntaxHighlight.ts` — CodeMirror language
- [ ] `lib/exportUtils.ts` — export format mapping
- [ ] `hooks/useDiagramRender.ts` — render path
- [ ] `app/api/render/route.ts` — engine allowlist
- [ ] `components/EditorPanel.tsx` — selector UI
- [ ] `components/PreviewPanel.tsx` — preview rendering

# Review output format

Produce a structured review with:

1. **Summary** — one-paragraph description of the changeset
2. **Pass/Fail** — overall assessment
3. **Issues** — categorized list (critical / warning / suggestion)
4. **Positive aspects** — what the changeset does well
5. **Required actions** — what must be fixed before merge
