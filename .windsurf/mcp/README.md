# GraphViewer Windsurf MCP Setup

本项目的 Windsurf MCP 推荐使用 **全局配置**，因为官方 MCP 生效文件路径是：

- Windows: `%USERPROFILE%\\.codeium\\windsurf\\mcp_config.json`
- macOS / Linux: `~/.codeium/windsurf/mcp_config.json`

## 本项目推荐的 MCP

- `github`
  - 用于查看仓库、Issue、Pull Request、发布信息
- `brave-search`
  - 用于查询 Mermaid、Graphviz、Kroki、Next.js 等外部文档

## 如何启用

1. 打开本文件同目录下的 `mcp_config.example.json`
2. 将其内容复制到你的全局 `mcp_config.json`
3. 配置环境变量：
   - `GITHUB_PERSONAL_ACCESS_TOKEN`
   - `BRAVE_API_KEY`
4. 重启 Windsurf 或在 MCP 设置里重新加载

## 为什么没有把 MCP 直接写进项目配置

根据官方文档，Windsurf 的 MCP 当前使用全局配置文件，不会自动读取工作区内的 `.windsurf/mcp/*.json`。

因此这里提供的是：

- **项目推荐配置模板**
- **项目内 skills**
- **项目内可复用说明**

这样既不会覆盖你现有的全局 MCP，又能让这个仓库保留一套可共享的推荐配置。
