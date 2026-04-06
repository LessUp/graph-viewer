# GraphViewer 发布前加固与文档补完

日期：2026-04-06

## 变更内容

- 统一 `.github/workflows/ci.yml` 与 Pages workflow 的 Node.js 版本到 22，减少构建环境漂移。
- 扩展 `app/api/render/route.test.ts`，补充请求体校验、格式校验、超长 payload、缓存命中、PNG/PDF 响应、网络错误、上游渲染错误与配置错误等覆盖场景。
- 扩展 `hooks/__tests__/useDiagramRender.test.tsx`，补充 Graphviz 本地渲染、远程错误提示、二进制下载与并发请求仅保留最新结果的行为验证。
- 为编辑器新增 `Ctrl+S` / `⌘+S` 快捷键，支持直接导出当前图表源码。
- 完善 `README.md` 与 `README.zh-CN.md`：补充单文件测试命令、分享链接压缩原理与长度限制、实时预览性能建议、代码风格约定、docker-compose 推荐流程。
- 补齐 `PreviewPanel` 的 PNG/PDF 预览失败态与降级提示，让远程渲染失败时界面反馈更明确。
- 将 CI workflow 扩展为构建后启动生产服务并执行 smoke test，同时在 CI 中注入本地 mock Kroki，避免校验链路依赖公网环境。
- 将 `package.json` 版本提升为 `1.0.0`，并同步更新 `/api/render` 请求头中的 GraphViewer 版本标识。
- 将 `start` 脚本调整为 `node .next/standalone/server.js`，与 `output: 'standalone'` 的生产构建方式保持一致。
- 更新 `TODO.md` 与 `CHANGELOG.md`，同步已完成事项与版本摘要。

## 背景

项目已具备完整的功能链路，但在发布前仍存在测试覆盖不足、CI 环境版本不一致、快捷键体验缺口以及 README 缺少关键运行约束说明等问题。这些问题会影响发版稳定性和首次使用体验，因此本次集中做发布前加固。

## 验证

- 预期执行：`npm run test`
- 预期执行：`npm run typecheck`
- 预期执行：`npm run lint`

## 后续说明

- Pages 静态模式仍主要适合本地 SVG 渲染；复杂远程引擎建议配合可跨域访问的 Kroki 服务使用。
- 若继续提高企业级发布标准，可在后续增加结构化日志、监控告警和 CI 冒烟测试。
