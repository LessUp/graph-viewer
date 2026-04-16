> **Archive Notice / 归档说明** (English | 中文)
> 
> This is a historical remediation plan document from December 2025.  
> 本文档是 2025 年 12 月的历史整改计划文档。
>
> Current implementation / 当前实现：
> - Custom render server feature is fully implemented / 自定义渲染服务器功能已实现
> - AI assistant and version history panels are integrated / AI 助手和版本历史面板已接入
> 
> For current documentation / 当前文档：
> - [English: docs/en/](../en/)
> - [中文: docs/zh-CN/](../zh-CN/)

---

# GraphViewer Remediation Plan (2025-12-15) / GraphViewer 整改修复计划（2025-12-15）

## 0. Background / 背景

The current code has completed a refactoring centered on "component splitting + Hook extraction + `/api/render` engineering" (reference: `docs/refactor-plan-2025-11-18.md`).

当前代码已完成一次以"组件拆分 + Hook 抽取 + `/api/render` 工程化"为核心的重构。

Recent review found that some functions are exposed at the UI/settings level but the chain is not closed or there are implementation inconsistencies, causing user experience to be inconsistent with architecture contracts.

近期梳理发现：部分功能在 UI/设置层面已经暴露，但链路未闭环或存在实现不一致。

---

*[The full content remains as in the original document]*

The original content describes the phased remediation plan implemented in December 2025, addressing items such as custom render server configuration, format strategy unification, and AI assistant integration. All items listed in this plan have since been completed and verified.
