# CLAUDE.md — GraphViewer 执行手册

> AI 流程总章见 [`AGENTS.md`](AGENTS.md)。本文件面向实际编码执行：命令、边界、文件地图和高风险 checklist。

## 核心命令

```bash
npm run dev              # 开发服务器，端口 3000
npm run lint             # ESLint CLI
npm run lint:fix         # 自动修复可修复 lint 问题
npm run format:check     # Prettier 检查
npm run format           # Prettier 格式化
npm run typecheck        # tsc --noEmit
npm run test             # Vitest 单元测试
npx vitest run path.ts   # 单文件测试
npm run build            # 完整服务版构建，含 API routes
npm run build:static     # GitHub Pages 静态导出
npm run test:smoke       # 生产服务 smoke test
```

## 代码约束

- UI 文案保持中文。
- `lib/` 下纯逻辑文件不要添加 `'use client'`。
- `catch` 使用 `catch (e: unknown)`，再用 `e instanceof Error` 收窄。
- 不使用 `any`；需要未知输入时用 `unknown`、类型守卫或现有工具函数。
- 修改 hook 返回值时检查 `app/editor/page.tsx` 等所有消费者。
- 不吞错误：按现有 Toast、logger 或 API error payload 模式显式暴露。

## 关键文件地图

| 责任                   | 文件                                                   |
| ---------------------- | ------------------------------------------------------ |
| 引擎/格式/展示分组     | `lib/diagramConfig.ts`                                 |
| 示例代码               | `lib/diagramSamples.ts`                                |
| 图表文档类型           | `lib/types.ts`                                         |
| 本地存储               | `lib/storage.ts`                                       |
| 工作区状态             | `hooks/useDiagramState.ts`                             |
| 实时预览 debounce/取消 | `hooks/useLivePreview.ts`                              |
| 本地/远程渲染          | `hooks/useDiagramRender.ts`                            |
| Kroki API route        | `app/api/render/route.ts`                              |
| API 缓存/限流          | `lib/server/renderCache.ts`, `lib/server/rateLimit.ts` |
| 编辑器 UI              | `components/editor/EditorPanel.tsx`                    |
| 预览 UI                | `components/preview/PreviewPanel.tsx`                  |
| 导出工具栏             | `components/preview/PreviewToolbar.tsx`                |
| GitHub Pages 门户      | `app/page.tsx`, `components/landing/*`                 |
| 静态导出               | `scripts/build-static-export.mjs`, `next.config.js`    |

## 引擎/格式变更 Checklist

任何新增、删除或改名必须同步：

1. `lib/diagramConfig.ts`：类型、labels、categories、Kroki type、本地能力。
2. `lib/diagramSamples.ts`：默认示例。
3. `lib/syntaxHighlight.ts`：CodeMirror 语言映射。
4. `lib/exportUtils.ts`：导出扩展名和 markdown fence。
5. `hooks/useDiagramRender.ts`：本地/远程分流。
6. `app/api/render/route.ts` 与 `openspec/specs/api/openapi.yaml`：API 白名单。
7. `components/editor/EditorPanel.tsx`：选择器。
8. `components/preview/*`：预览和导出入口。
9. `app/page.tsx` / `components/landing/*`：门户展示能力。
10. `lib/__tests__/diagramConfig.test.ts` 与相关渲染测试。

## 静态演示版约束

GitHub Pages 只提供静态演示版：

- 可用：Mermaid、Graphviz、Flowchart.js 的本地 SVG 渲染。
- 不可用：`/api/render`、远程 Kroki 引擎、PNG/PDF 远程导出、服务端 AI。
- `scripts/build-static-export.mjs` 会复制工作区到临时目录并移除 `app/api`。
- 改 Pages 时必须运行 `npm run build:static`。

## API 约束

`POST /api/render` 必须保持：

- 最大输入长度来自 `APP_CONFIG.render.maxCodeLength`。
- Kroki 请求超时来自 `APP_CONFIG.render.timeoutMs`。
- 自定义 Kroki URL 必须通过规范化和 allowlist。
- 错误响应使用稳定 `code`，不得随意改名。
- 缓存和限流逻辑在 `lib/server/`，route 不放顶层 `setInterval`。

## AI 工具链边界

- `AGENTS.md` 是跨代理总章。
- `CLAUDE.md` 是执行手册。
- `.github/copilot-instructions.md` 是极简 Copilot 上下文。
- 不维护 `QWEN.md`、`.windsurf/` 或大段通用模板。
- MCP 适合 GitHub/浏览器/外部文档等外部上下文；重复流程优先用 CLI skills。

## 变更记录

影响用户可见行为、部署、AI 指令或工程流程的变更需要更新 `CHANGELOG.md`，必要时在 `changelog/archive/` 保留详细历史。
