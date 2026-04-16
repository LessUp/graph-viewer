# Changelog / 更新日志

All notable changes to this project will be documented in this file.  
本项目所有显著变更都将记录在此文件中。

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),  
格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，  
and this project adheres to [Semantic Versioning](https://semver.org/lang/zh-CN/).  
版本号遵循 [Semantic Versioning](https://semver.org/lang/zh-CN/)。

---

## [1.0.0] - 2026-04-16

### 中文 / Chinese

#### 新增 / Added
- 添加 Docker 部署配置和 Dockerfile
- 添加 GitHub Actions CI 工作流
- 添加 AI 助手面板和 hook
- 添加版本历史面板和 hook
- 添加导出工具：SVG、PNG (2x/4x)、HTML、Markdown
- 添加分享链接功能（LZ-string 压缩）
- 添加自定义 Kroki 服务器设置
- 添加 Ctrl+S / ⌘+S 快捷键导出源码

#### 变更 / Changed
- 升级 Next.js 15 + React 19
- 重构组件架构：拆分 EditorPanel、PreviewPanel 等
- 统一 Node.js 版本到 22
- 优化 PNG 导出质量（0.95）和双重渲染策略
- Mermaid 启用 `securityLevel: 'strict'` 安全设置

#### 修复 / Fixed
- 修复依赖管理问题（添加缺失依赖，移除未使用依赖）
- 修复 SVG 样式内联问题
- 修复自定义渲染服务器不生效的问题
- 修复测试环境和 CI 配置

### English

#### Added
- Docker deployment configuration and Dockerfile
- GitHub Actions CI workflow
- AI Assistant panel and hooks
- Version History panel and hooks
- Export utilities: SVG, PNG (2x/4x), HTML, Markdown
- Share link functionality with LZ-string compression
- Custom Kroki server settings
- Ctrl+S / ⌘+S keyboard shortcut for exporting source code

#### Changed
- Upgraded to Next.js 15 + React 19
- Refactored component architecture: EditorPanel, PreviewPanel, etc.
- Unified Node.js version to 22
- Optimized PNG export quality (0.95) and dual rendering strategy
- Mermaid enabled `securityLevel: 'strict'` security setting

#### Fixed
- Fixed dependency management issues (added missing, removed unused)
- Fixed SVG style inlining issues
- Fixed custom render server not working issue
- Fixed test environment and CI configuration

---

## Previous Releases / 早期版本

### 2026-03-10 - Workflow Deep Standardization / 工作流深度标准化
- CI workflow unified `permissions`, `concurrency` configuration
- Pages workflow added `actions/configure-pages@v5` step
- Pages workflow added `paths` trigger filtering

### 2026-03-09 - Workflow Optimization / 工作流优化
- Added standardized GitHub Actions CI workflow
- Standardized triggers for `push`, `pull_request`, `workflow_dispatch`
- Added Node.js validation job covering `lint`, `typecheck`, `test`, `build`

### 2025-12-08 - Export Quality / 导出质量改进
- SVG preprocessing enhancement with style inlining
- Dual conversion strategy: html2canvas + native Image fallback
- PNG quality improved to 0.95 with high smoothing

### 2025-11-23 - UI/UX Overhaul / 界面交互深度优化
- SVG infinite zoom and pan in PreviewPanel
- PreviewToolbar with zoom controls
- Mouse wheel zoom (Ctrl + scroll) and drag panning

### 2025-11-18 - Architecture Refactor / 架构重构
- Core module extraction: `diagramConfig.ts`, `diagramSamples.ts`
- Hooks: `useDiagramState`, `useDiagramRender`
- Components: `EditorPanel`, `PreviewPanel`
- `/api/render` enhancements with caching and validation

### 2025-11-10 - Project Init / 项目初始化
- Next.js 14 + Tailwind CSS project initialization
- `/api/render` endpoint for Kroki proxy
- Frontend editor and preview page
- Mermaid local rendering as fallback

### 2025-02-25 - Cleanup & Architecture / 清理与架构重构
- Removed dead files and backup files
- Unified icon system with lucide-react
- Font loading optimization with `next/font`
- Toast system and ESLint/Prettier setup
- Component splitting: `AppHeader`, `DiagramList`, etc.

---

## Template / 模板格式

```
## [Version] - YYYY-MM-DD

### Added / 新增
- New features / 新功能

### Changed / 变更
- Changes in existing functionality / 现有功能变更

### Deprecated / 废弃
- Soon-to-be removed features / 即将移除的功能

### Removed / 移除
- Now removed features / 已移除的功能

### Fixed / 修复
- Bug fixes / Bug 修复

### Security / 安全
- Security improvements / 安全改进
```
