---
description: 性能检查：构建分析 + bundle 体积 + 渲染基准测试
---

1. Run production build and check output size:
   // turbo

```
npm run build
```

2. Review the Next.js build output:
   - Check route sizes in the build summary
   - Look for pages larger than 200KB (First Load JS)
   - Verify dynamic imports are splitting correctly

3. Run the built-in benchmark:
   // turbo

```
npm run bench
```

4. (Optional) Analyze bundle composition with `@next/bundle-analyzer`:

```
ANALYZE=true npm run build
```

5. Check for heavy dependencies:
   // turbo

```
npx depcheck --ignores="@types/*,autoprefixer,postcss,eslint-*,prettier-*"
```

6. Start dev server and manually test render performance:

```
npm run dev
```

   - Type rapidly in the editor — preview should stay responsive
   - Switch engines — first render should complete in < 2s
   - Render a large diagram (>50 nodes) — should not freeze the UI
   - Export PNG — should complete in < 5s

7. Review results and identify optimization targets:
   - Bundle size regressions > 10KB need justification
   - Render time regressions > 500ms need investigation
   - Use the `graphviewer-performance-audit` skill for detailed guidance
