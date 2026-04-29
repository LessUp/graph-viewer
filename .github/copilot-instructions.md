# GraphViewer Copilot 指令

GraphViewer 是 Next.js 15 + React 19 多引擎图表编辑器。静态版本地渲染 Mermaid / Graphviz / Flowchart.js，完整服务版通过 Kroki 支持 16+ 引擎和 PNG/PDF 导出。

## 必守规则

- 默认使用中文与用户沟通；UI 文案保持中文。
- 改代码前优先读 `AGENTS.md`、`CLAUDE.md` 和相关 `openspec/specs/`。
- 引擎、格式、Kroki 类型、本地渲染能力只从 `lib/diagramConfig.ts` 获取。
- 渲染相关改动必须同时检查 `hooks/useLivePreview.ts`、`hooks/useDiagramRender.ts`、`app/api/render/route.ts`、`lib/server/*`。
- 静态导出模式没有 API routes；GitHub Pages 只能提供本地 SVG 演示能力。
- 不要重新引入 `QWEN.md`、`.windsurf/`、Dependabot 自动分支或通用 AI 模板。
- bug fix 先写失败测试；完成前运行相关 `npm run lint`、`npm run typecheck`、`npm run test`、`npm run build`。

## 常用入口

- 架构：`openspec/specs/architecture/0001-core-architecture.md`
- API：`openspec/specs/api/openapi.yaml`
- 产品边界：`openspec/specs/product/roadmap.md`
- 执行手册：`CLAUDE.md`
