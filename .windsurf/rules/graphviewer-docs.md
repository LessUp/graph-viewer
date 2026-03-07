---
trigger: glob
globs:
  - '*.md'
  - 'docs/**/*.md'
  - 'changelog/**/*.md'
---

# GraphViewer 文档规则

- 优先更新现有文档，不重复创建功能相同的 README、ROADMAP、TODO 或说明文档。
- 文档里出现的脚本、命令、文件路径、端口、测试方式必须与当前仓库实现一致。
- 删除文件后，要检查是否存在悬挂引用，重点关注：
  - `README.md`
  - `ROADMAP.md`
  - `ROADMAP-intranet.md`
  - `TODO.md`
  - `TODO-intranet.md`
  - `docs/`
  - `changelog/`
- 规划类文档可以保留历史上下文，但如果标记为“已完成”或“已删除”，必须与代码现状一致。
