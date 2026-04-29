# 2026-04-29 最终收尾与工程加固

本次变更将项目从“功能完成”进一步收敛为“稳定可归档”的工程状态，重点处理代码边界、门户质量、文档可信度、CI/CD 极简化与 AI 工具链治理。

## 主要变更

- **修复实时预览取消链路**：`useDiagramRender` 支持外部 `AbortSignal`，避免 live preview 旧请求覆盖新输出。
- **模块化渲染 API 状态**：将 `/api/render` 的缓存、inflight 去重与限流逻辑抽到 `lib/server/`，移除 route 顶层定时器。
- **统一引擎配置来源**：landing、编辑器与提示组件复用 `lib/diagramConfig.ts` 的本地渲染能力和展示分组。
- **重构 GitHub Pages 门户基础**：首页改为 server-first，拆出小型交互组件，补齐 OG 图和产品截图资产。
- **治理文档与产品边界**：README 修复部署混链，OpenSpec 产品文档改为稳定收尾边界，删除重复索引和占位截图。
- **精简工程化**：删除 Dependabot 自动分支策略，CI/Pages/Lighthouse 收敛到 `master` 单主线，Lint 迁移到 ESLint CLI。
- **重写 AI 指令**：`AGENTS.md`、`CLAUDE.md`、Copilot 指令改为 GraphViewer 专属规则，明确禁止重新引入冗余平台模板。
- **GitHub 元数据清理**：修复仓库描述乱码，精简 topics，确认 Pages URL。

## 验证重点

- 运行 lint、format、typecheck、unit tests、完整构建、静态导出和 smoke test。
- 确认本地/远端只保留主线分支。
- 确认 Pages 文档、workflow 与 GitHub About 信息一致。
