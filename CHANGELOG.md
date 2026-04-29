# GraphViewer 变更日志

所有重要变更按时间倒序记录。详细内容见 [`changelog/archive/`](./changelog/archive/) 目录。

## [2026-04-29] 最终收尾与工程加固

围绕“稳定可归档”目标完成一轮工程收尾：

- **修复核心渲染问题**：接通 live preview 外部取消信号，拆分 `/api/render` 缓存、inflight 与限流模块。
- **优化 Git Pages 门户**：首页改为 server-first，补齐 OG 图与截图资产，移除 README 占位图。
- **治理文档与 AI 指令**：重写 AGENTS/CLAUDE/Copilot 指令，收敛产品 roadmap/todo，修复部署文档混链。
- **精简工程化**：删除 Dependabot 自动分支策略，Actions 收敛到 `master` 单主线，Lint 迁移到 ESLint CLI。
- **净化 GitHub 仓库**：删除远端 Dependabot 分支，修复 About 描述和 topics。

→ [详情](./changelog/archive/2026-04-29-finalization-hardening.md)

## [2026-04-27] 项目重构与规范化

全面清理项目结构，删除冗余目录和配置，精简 CI/CD 工作流：

- **删除冗余目录**：`_bmad/`, `_bmad-output/`, `_output/`, `.windsurf/`
- **精简 AI 指令**：删除 `QWEN.md`，精简 `copilot-instructions.md`
- **精简 CI/CD**：`pages.yml` (337→108行), `lighthouse.yml` (180→53行)
- **精简文档**：合并 `installation.md` 到 `quick-start.md`
- **归档 changelog**：所有历史 changelog 移入 `archive/`
- **清理分支**：关闭 9 个过时的 dependabot PRs

## [2026-04-23] OpenSpec 规范迁移

完全采用 OpenSpec 规范重构项目开发模式：迁移 specs/ 到 openspec/specs/，配置 config.yaml，更新所有 AI 指令文件（AGENTS.md、CLAUDE.md、QWEN.md），使用 Core Profile 工作流（/opsx:propose、/opsx:apply、/opsx:archive）。

→ [详情](./changelog/2026-04-23-openspec-migration.md)

## [2026-04-17] 文档重组与规范驱动开发

按照 SDD 最佳实践重组项目文档：明确 CLAUDE.md、AGENTS.md、specs/ 的职责边界，移除冗余内容，删除 docs/archive 目录，保留 .windsurf 配置。

→ [详情](./changelog/2026-04-17-documentation-restructure.md)

## [2026-04-17] 项目完善度检查与修复

全面检查项目代码质量，修复安全问题、错误处理缺失、调试代码残留等问题。增强 TypeScript 严格模式、创建统一日志工具、替换原生对话框为自定义组件、增强健康检查。

→ [详情](./changelog/2026-04-17-project-improvements.md)

## [2026-04-16] 依赖清理与文档重构

修复依赖管理问题：新增缺失的 `@codemirror/state` 和 `@codemirror/view` 依赖，移除未使用的依赖包。统一 Docker 与 CI 的 Node.js 版本至 22。

→ [详情](./changelog/2026-04-16-dependency-cleanup.md)

## [2026-04-06] 发布前加固与文档补完

统一 CI Node 版本到 22，补齐 `/api/render` 与 `useDiagramRender` 测试覆盖，增加 `Ctrl+S` 源码导出快捷键，补完 README 中的分享链接、实时预览、代码风格与 docker-compose 使用说明，并将 smoke test 接入 CI 生产启动校验。

→ [详情](./changelog/2026-04-06-release-hardening.md)

## [2026-03-10] Workflow 深度标准化

优化 CI/CD 流程，增加并发控制、缓存策略和部署保护。

→ [详情](./changelog/2026-03-10_workflow-deep-standardization.md)

## [2026-03-09] Workflow 优化

改进 GitHub Actions 工作流配置，提升构建效率。

→ [详情](./changelog/2026-03-09_workflow-optimization.md)

## [2025-12-08] 导出功能质量改进

SVG 预处理增强（样式内联、命名空间补全）、html2canvas + 原生 Image 双重转换策略、PNG 导出质量提升至 0.95、自动回退机制。

→ [详情](./changelog/2025-12-08-export-quality.md)

## [2025-11-23] 界面交互深度优化

PreviewPanel 重写支持无限缩放与平移、新增 PreviewToolbar 悬浮工具栏、纯前端 SVG → PNG 导出、多格式下载与剪贴板复制、布局优化。

→ [详情](./changelog/2025-11-23-ui-ux-overhaul-v2.md)

## [2025-11-18] 架构重构与功能增强

抽取 diagramConfig / diagramSamples / useDiagramState / useDiagramRender 核心模块、UI 组件拆分（EditorPanel / PreviewPanel）、API 加固（长度限制 / 超时 / 缓存修复）、编辑体验增强、分享链接、安全加固、Kroki 自建方案。

→ [详情](./changelog/2025-11-18-architecture-refactor.md)

## [2025-02-25] 清理、基础设施与架构重构

阶段 1 清理死文件、统一图标系统（lucide-react）、优化字体加载、提取 Toast 组件、添加 ESLint + Prettier 配置。阶段 2 拆分 AppHeader / DiagramList / CollapsedSidebar / ErrorBoundary 组件，page.tsx 精简约 40%。

→ [详情](./changelog/2025-02-25-cleanup-and-architecture.md)

## [2025-11-10] 项目初始化与首次部署

Next.js 14 + Tailwind 项目骨架、/api/render Kroki 代理、Mermaid 本地兜底渲染、PDF iframe 预览、Netlify 首次部署。

→ [详情](./changelog/2025-11-10-project-init.md)
