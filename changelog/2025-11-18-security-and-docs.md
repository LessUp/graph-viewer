# 2025-11-18 安全设置与文档更新

- Mermaid 本地渲染初始化时启用 `securityLevel: 'strict'`，收紧前端 SVG 渲染的安全策略，仅在浏览器内执行渲染逻辑。
- 更新 `README.md`：
  - 在配置说明中补充架构总览，明确前端（page + components + hooks）、后端（`/api/render` + `/api/healthz`）以及配置模块（`lib/diagramConfig.ts`、`lib/diagramSamples.ts`）的分工。
  - 新增“安全说明”章节，描述本地渲染与远程 Kroki 渲染的数据流向、日志记录范围及使用建议（敏感场景优先本地渲染或使用自建 Kroki 实例）。
- 与此前的 `/api/render` 加固（超时、长度限制与最小化日志）共同构成一套基础安全与健壮性保障。
