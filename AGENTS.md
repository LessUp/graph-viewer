# AGENTS.md — GraphViewer AI 代理总章

> 本文件是所有 AI 代理进入 GraphViewer 仓库后的总入口。它定义“先读什么、能改什么、必须同步什么、绝不能做什么”。具体命令和代码 checklist 见 [`CLAUDE.md`](CLAUDE.md)。

## 项目一句话

GraphViewer 是 Next.js 15 + React 19 构建的多引擎图表编辑器：静态演示版在浏览器本地渲染 Mermaid / Graphviz / Flowchart.js，完整服务版通过 `/api/render` 代理 Kroki 支持 PlantUML、D2、Vega 等 16+ 引擎和 PNG/PDF 导出。

## 代理工作原则

1. **规格先行**：行为、API、架构或部署策略变化必须先读 `openspec/specs/`。新功能或设计影响较大的 bug 修复应创建 `openspec/changes/<change>/` 提案。
2. **小修可直改**：拼写、链接、测试补强、无行为变化的重构可直接修改，但必须同步受影响文档和测试。
3. **单一事实源**：引擎、格式、展示分组、Kroki 类型和本地渲染能力均来自 `lib/diagramConfig.ts`，业务代码禁止散落 magic string。
4. **静态/完整双模式**：任何渲染、导出或路由改动都必须同时考虑 GitHub Pages 静态演示版和 Docker/Node 完整服务版。
5. **测试保护行为**：修 bug 必须先写失败测试；改 API、hook、导出或配置必须运行相关测试。
6. **不制造维护负担**：不得重新引入 `QWEN.md`、`.windsurf/`、Dependabot 自动分支策略或泛化 AI 模板目录。

## 必读规格

| 场景      | 必读                                                                  |
| --------- | --------------------------------------------------------------------- |
| 架构/部署 | `openspec/specs/architecture/0001-core-architecture.md`               |
| API 响应  | `openspec/specs/api/openapi.yaml`                                     |
| 数据结构  | `openspec/specs/data/schema-v1.dbml`                                  |
| 测试行为  | `openspec/specs/testing/diagram-render.feature`                       |
| 产品边界  | `openspec/specs/product/roadmap.md`, `openspec/specs/product/todo.md` |

## 高风险改动门禁

### 引擎或格式

同步检查：

- `lib/diagramConfig.ts`
- `lib/diagramSamples.ts`
- `lib/syntaxHighlight.ts`
- `lib/exportUtils.ts`
- `hooks/useDiagramRender.ts`
- `app/api/render/route.ts`
- `components/editor/EditorPanel.tsx`
- `components/preview/PreviewPanel.tsx`
- `components/preview/PreviewToolbar.tsx`
- `app/page.tsx`
- `openspec/specs/api/openapi.yaml`

### 渲染链路

- 本地渲染：`hooks/useDiagramRender.ts` 动态加载 Mermaid / Graphviz WASM。
- 实时预览：`hooks/useLivePreview.ts` 负责 debounce 和取消，必须防止旧请求覆盖新输出。
- 远程渲染：`app/api/render/route.ts` 只做请求编排；缓存和限流在 `lib/server/`。
- 静态导出：`scripts/build-static-export.mjs` 会移除 `app/api`，因此静态版不得依赖后端 API。

### 安全边界

- Kroki URL 必须规范化并受 allowlist 约束。
- 输入长度、超时、rate limit、inflight 去重不可绕过。
- SVG 进入预览前必须净化。
- API Key 不得写入 localStorage；AI 面板只能浏览器直连供应商。

## Git 与工程策略

- 默认主线为 `master`；不要创建长期维护分支。
- 依赖升级采用人工批量升级，不使用 Dependabot 自动分支。
- worktree 只用于临时隔离；完成后必须移除，不能把会话状态提交进仓库。
- `.omc/`、本地配置、构建产物和工具缓存不得进入提交。

## 验证命令

```bash
npm run lint
npm run format:check
npm run typecheck
npm run test
npm run build
npm run build:static
```

生产服务器 smoke test 仅在 `npm run build` 后运行：

```bash
npm run test:smoke http://127.0.0.1:3000
```

## 输出语言

- 用户交互默认中文。
- UI 文案保持中文。
- 用户文档可按受众使用中文或中英双语；不要混入无项目上下文的 boilerplate。
