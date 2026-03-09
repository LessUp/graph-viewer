---
trigger: glob
globs:
  - app/**/*.ts
  - app/**/*.tsx
  - components/**/*.tsx
  - hooks/**/*.ts
  - lib/**/*.ts
  - next.config.js
---

# GraphViewer 性能规则

## 渲染性能

- `useLivePreview` 的 debounce 间隔由 `useSettings` 管理，不要硬编码额外的延迟。
- 大型图表代码（>10KB）渲染时，不要在主线程做同步解析；Mermaid 和 Graphviz WASM 已经是异步的，保持这个模式。
- `useDiagramRender` 中的 `renderDiagram` 应保持幂等——相同输入不应触发重复渲染请求。

## 缓存策略

- API 路由 `app/api/render/route.ts` 使用内存缓存（TTL 120s、最大 200 条）和 in-flight 去重。修改缓存参数时：
  - 评估内存占用（每条缓存约 50-200KB SVG）
  - 确保 `MAX_CACHE_SIZE` × 平均 SVG 大小不超过 50MB
  - 保持 in-flight 去重逻辑不被破坏
- 客户端不要在组件层重复缓存已经由 hook 管理的渲染结果。

## Bundle 体积

- 不要在客户端组件中直接 `import` 整个 `mermaid` 或 `@hpcc-js/wasm` 包，使用动态 `import()` 按需加载。
- `lucide-react` 图标使用具名导入（`import { Icon } from 'lucide-react'`），不要导入整个包。
- 新增依赖前评估其 bundle 体积影响，>100KB gzipped 的包需要有充分理由。

## React 渲染优化

- 避免在 `page.tsx` 的渲染函数中创建新的对象/数组字面量作为 props（会导致子组件不必要的 re-render）。
- 如果子组件接收 callback props，确保这些 callback 来自 hook 返回值或 `useCallback`，而不是内联箭头函数。
- `PreviewPanel` 和 `EditorPanel` 是重渲染的热点，修改时注意 re-render 频率。

## 图片与资源

- 导出 PNG 时 `html2canvas` 会在客户端执行 DOM 截图，避免在截图范围内包含不必要的 DOM 节点。
- SVG 输出通过 `dompurify` 消毒后再展示，不要为了性能跳过消毒步骤。
