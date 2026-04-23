# GraphViewer Windsurf MCP Setup

本项目的 Windsurf MCP 推荐使用 **全局配置**，因为官方 MCP 生效文件路径是：

- Windows: `%USERPROFILE%\.codeium\windsurf\mcp_config.json`
- macOS / Linux: `~/.codeium/windsurf/mcp_config.json`

## 推荐的 MCP 服务器

| 服务器           | 用途                                                               | 需要 API Key |
| ---------------- | ------------------------------------------------------------------ | :----------: |
| **context7**     | 查询 Next.js / React / Mermaid / Tailwind 等库的最新文档和代码示例 |      ❌      |
| **fetch**        | 获取外部网页内容（Kroki 文档、GitHub Release Notes 等）            |      ❌      |
| **filesystem**   | 读写项目文件、创建目录、搜索文件树                                 |      ❌      |
| **github**       | 查看仓库、Issue、Pull Request、创建分支、代码搜索                  |      ✅      |
| **brave-search** | Web 搜索（Mermaid 语法、Graphviz 属性、部署问题排查）              |      ✅      |

## 各 MCP 在 GraphViewer 中的典型用法

### context7 — 库文档查询

- 查询 Next.js App Router API（`/vercel/next.js`）
- 查询 React 19 新特性（`/facebook/react`）
- 查询 Mermaid 图表语法（`/mermaid-js/mermaid`）
- 查询 Tailwind CSS 类名（`/tailwindlabs/tailwindcss`）
- 查询 Vitest 测试 API（`/vitest-dev/vitest`）
- 查询 CodeMirror 扩展开发（`/codemirror/dev`）

### fetch — 外部资源获取

- 获取 Kroki 官方文档和支持的引擎列表
- 获取 GitHub Release Notes 和 Changelog
- 获取 npm 包信息和版本对比

### filesystem — 项目文件操作

- 创建新组件/hook/测试文件
- 批量搜索代码模式（如查找所有 `dangerouslySetInnerHTML` 使用）
- 查看目录树了解项目结构

### github — 仓库管理

- 查看和创建 Issue
- 查看 Pull Request 和 Review
- 搜索仓库代码
- 创建分支和提交文件

### brave-search — Web 搜索

- 搜索 Mermaid 图表语法和高级特性
- 搜索 Graphviz DOT 语言属性
- 搜索 Next.js 部署和 SSR 问题
- 搜索 Docker 和 Netlify 配置最佳实践

## 如何启用

1. 打开本文件同目录下的 `mcp_config.example.json`
2. 将其内容合并到你的全局 `mcp_config.json`
3. 配置需要 API Key 的服务器：
   - `GITHUB_PERSONAL_ACCESS_TOKEN` — [GitHub Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens)
   - `BRAVE_API_KEY` — [Brave Search API](https://brave.com/search/api/)
4. 不需要 API Key 的服务器（context7、fetch、filesystem）可直接使用
5. 重启 Windsurf 或在 MCP 设置里重新加载

## 为什么没有把 MCP 直接写进项目配置

根据官方文档，Windsurf 的 MCP 当前使用全局配置文件，不会自动读取工作区内的 `.windsurf/mcp/*.json`。

因此这里提供的是：

- **项目推荐配置模板** — `mcp_config.example.json`
- **项目内 skills** — `.windsurf/skills/` 下的技能描述
- **项目内 workflows** — `.windsurf/workflows/` 下的工作流
- **项目内 rules** — `.windsurf/rules/` 下的编码规则

这样既不会覆盖你现有的全局 MCP，又能让这个仓库保留一套可共享的推荐配置。
