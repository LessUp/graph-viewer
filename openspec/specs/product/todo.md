# GraphViewer 稳定收尾清单

> 本清单只记录当前稳定版必须保持的工程质量门禁和收尾事项。它不是开放式 backlog；不承诺新增功能。

## 必须保持的完成定义

- [x] 多图表工作区、版本历史、模板入口和本地持久化可用
- [x] Mermaid、Graphviz、Flowchart.js 可在静态演示版本地渲染
- [x] 完整服务版可通过 Kroki 渲染远程引擎和 PNG/PDF
- [x] `/api/render` 有输入校验、超时、缓存、限流和错误响应
- [x] SVG 输出在预览前经过净化
- [x] `npm run lint`、`npm run typecheck`、`npm run test`、`npm run build` 可作为主线质量门禁

## 当前收尾事项

- [ ] 确认 GitHub Pages 首页、README、docs、OpenSpec 对“演示版 vs 完整版”的描述一致
- [ ] 确认 AI 指令文件只保留项目必要规则，不复制通用模板
- [ ] 确认 CI/CD 只服务主线质量门禁和 Pages 部署
- [ ] 确认依赖升级不再自动生成长期维护分支
- [ ] 确认最终分支和 worktree 状态干净

## 未来变更入口

如需恢复新增功能开发，请按以下顺序处理：

1. 在 `openspec/changes/<change-name>/` 创建 proposal/design/tasks/spec delta。
2. 更新受影响的 `openspec/specs/` 文档。
3. 按 `AGENTS.md` 和 `CLAUDE.md` 的引擎/API/导出 checklist 实施。
4. 运行完整验证后再合并到主线。
