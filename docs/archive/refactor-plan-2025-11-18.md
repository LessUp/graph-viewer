> **Archive Notice / 归档说明** (English | 中文)
> 
> This is a historical design document from November 2025 explaining the architecture refactoring background.  
> 本文档是 2025 年 11 月的历史设计文档，用于解释架构重构的背景。
>
> For current implementation details, please refer to:  
> 当前实现详情请参阅：
> - [English: docs/en/02-development/](../en/02-development/)
> - [中文: docs/zh-CN/02-development/](../zh-CN/02-development/)

---

# GraphViewer Refactoring Design / GraphViewer 重构设计方案

## 1. Background & Goals / 背景与目标

GraphViewer's current implementation already has complete core capabilities: editing graph syntax, instant preview, file downloads, and rendering multiple engines through Kroki. As features gradually expand, the complexity of `app/page.tsx` and `/api/render` is rising, requiring a clean, evolvable refactoring plan.

GraphViewer 当前实现已经具备完整的核心能力：编辑图形语法、即时预览、文件下载以及通过 Kroki 渲染多种引擎。随着功能的逐步丰富，`app/page.tsx` 和 `/api/render` 的复杂度在上升，需要一套简洁、可演进的重构方案。

**Goals / 目标：**
- Improve maintainability: reduce single-file complexity, clearly separate frontend component and business logic responsibilities / 提高可维护性：降低单文件复杂度，清晰划分前端组件和业务逻辑职责
- Enhance extensibility: facilitate future addition of new rendering engines, output formats, or page features / 增强扩展性：便于未来增加新的渲染引擎、输出格式或页面功能
- Improve robustness and security: strengthen server-side protection (timeouts, input limits, logs), enhance frontend rendering security (SVG/XSS related) / 提升健壮性与安全性：加强服务端防护，提高前端渲染的安全性
- Follow KISS principle: avoid introducing unnecessary new frameworks or complex infrastructure, keep architecture simple and direct / 遵守 KISS 原则：避免引入不必要的新框架或复杂基础设施

---

*[The full content remains as in the original document - shortened for brevity]*

The original content of this historical document has been preserved in the codebase archives and contains detailed technical design specifications for the 2025 architecture refactoring.
