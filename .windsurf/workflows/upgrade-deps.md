---
description: 更新 npm 依赖并验证构建，确保依赖升级不引入回归。
---

1. Check for outdated packages:
   // turbo

```
npm outdated
```

2. Review the output and decide which packages to update:
   - **Patch/minor updates**: generally safe
   - **Major updates**: check changelogs for breaking changes
   - **Critical packages** (handle with extra care):
     - `next` — check Next.js migration guide
     - `react` / `react-dom` — check React release notes
     - `mermaid` — check Mermaid changelog for API changes
     - `@hpcc-js/wasm` — check Graphviz WASM compatibility
     - `dompurify` — security-critical, always update

3. Update selected packages:

```
npm update <package-name>
```

Or for major version bumps:

```
npm install <package-name>@latest
```

4. Run lint to check for new rule violations:
   // turbo

```
npm run lint
```

5. Run tests:
   // turbo

```
npm run test
```

6. Run build to catch type/compilation errors:
   // turbo

```
npm run build
```

7. Start dev server and manually verify:

```
npm run dev
```

   - Main page loads
   - Mermaid and Graphviz samples render
   - SVG / PNG / PDF switching works
   - Export actions work
   - Settings modal works

8. Check for security vulnerabilities:
   // turbo

```
npm audit
```

9. If all checks pass, commit:

```
git add package.json package-lock.json
```

```
git commit -m "chore(deps): update dependencies"
```
