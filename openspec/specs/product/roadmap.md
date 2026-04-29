# GraphViewer 产品路线图

> 本文档描述 GraphViewer 当前稳定版的产品边界和维护策略。核心功能已经完成，后续工作以稳定性、安全性、文档可信度和部署体验为优先，不再维护开放式功能愿望清单。

## 产品定位

GraphViewer 是一个面向开发者、技术写作者和小团队的多引擎图表编辑与预览工具。它用同一个界面覆盖 Mermaid、PlantUML、Graphviz、D2、Vega 等图表语法，并通过“本地 WASM + 远端 Kroki”的混合渲染模式平衡隐私、速度和引擎覆盖面。

## 已稳定能力

| 能力域   | 当前状态                                                                      |
| -------- | ----------------------------------------------------------------------------- |
| 编辑体验 | CodeMirror 编辑器、语法高亮、快捷键、实时预览                                 |
| 渲染架构 | Mermaid/Graphviz/Flowchart.js 本地渲染，其他引擎经 `/api/render` 代理到 Kroki |
| 工作区   | 多图表管理、本地持久化、版本历史、模板入口                                    |
| 导出分享 | SVG/PNG/PDF/HTML/Markdown/source 导出，LZ-string URL 分享                     |
| 部署模式 | GitHub Pages 静态演示版，Docker/Node 完整服务版                               |
| 工程质量 | Vitest、TypeScript strict、ESLint、Prettier、CI、smoke test                   |

## 当前维护目标

1. **稳定优先**：修复已知 bug、补足关键测试、保持构建链路可重复。
2. **文档可信**：README、docs、OpenSpec、AI 指令必须互相一致，不保留过时入口。
3. **部署清晰**：明确 GitHub Pages 是静态演示版，Docker/Node 是完整功能路径。
4. **工具链极简**：避免持续自动创建维护分支，依赖升级采用人工批量处理。
5. **安全边界明确**：Kroki URL、输入长度、超时、SVG 净化和静态导出限制必须可追踪。

## 明确非目标

以下能力不属于当前稳定收尾范围，除非未来重新创建 OpenSpec 变更提案：

- `/api/share` 短链接服务
- 多人协作、权限系统或账号体系
- 插件市场或第三方扩展机制
- Sentry/监控/告警等运维平台集成
- 新增图表引擎或大规模 UI 重写

## 变更准入

任何新功能或行为改变必须先更新 `openspec/specs/` 或创建 `openspec/changes/` 提案。小型 bug 修复可以直接实现，但必须补测试并确认不改变 API、引擎配置或静态导出约束。
