---
trigger: glob
globs:
  - '*.md'
  - 'docs/**/*.md'
  - 'changelog/**/*.md'
  - '.windsurf/**/*.md'
---

# GraphViewer 文档规则

## 文档维护原则

- 优先更新现有文档，不重复创建功能相同的 README、ROADMAP、TODO 或说明文档。
- 文档里出现的脚本、命令、文件路径、端口、测试方式必须与当前仓库实现一致。
- 规划类文档可以保留历史上下文，但如果标记为"已完成"或"已删除"，必须与代码现状一致。

## 悬挂引用检查

删除或重命名代码文件后，要检查是否存在悬挂引用，重点关注：

- `README.md`、`ROADMAP.md`、`ROADMAP-intranet.md`
- `TODO.md`、`TODO-intranet.md`
- `docs/`、`changelog/`
- `.windsurf/rules/`、`.windsurf/skills/`

## Changelog 规范

- 文件路径：`changelog/YYYY-MM-DD-<short-slug>.md`
- 每次新增 changelog 后，同步更新项目根目录 `CHANGELOG.md` 的摘要条目。
- 详细模板见 `/changelog` workflow。

## .windsurf 文档

修改 `.windsurf/` 下的 rules、skills、workflows 时：

- 确保文件引用与当前代码结构一致。
- 新增 skill 或 workflow 时，描述（description）要简洁准确，方便 Cascade 自动匹配。
