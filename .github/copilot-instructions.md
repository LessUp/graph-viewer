# GraphViewer 项目规则

> 完整工作流请参考 [AGENTS.md](../AGENTS.md)

## 编程准则

- **工具优先**: 遇到问题优先探索代码，再策划修改方案
- **多文件协同**: 修改代码时检查跨文件依赖和引用，防止遗漏
- **根因导向**: 分析本质问题而非修补表面症状
- **安全操作**: 不执行不可恢复的操作（除非用户明确要求）

## 技术约束

- **UI 文案**: 保持中文
- **类型安全**: `catch (e: unknown)` + `instanceof Error`
- **核心模块复用**: 优先复用 `useDiagramState`, `useDiagramRender`, `lib/diagramConfig.ts`

## 核心命令

```bash
npm run dev         # 开发服务器
npm run test        # 单元测试
npm run lint        # ESLint 检查
npm run typecheck   # TypeScript 检查
npm run build       # 生产构建
```

## OpenSpec 工作流

本项目采用 Spec-Driven Development，使用 OpenSpec 管理变更：

| 命令         | 用途           |
| ------------ | -------------- |
| `/opsx:explore` | 探索和澄清需求 |
| `/opsx:propose` | 创建变更提案   |
| `/opsx:apply`   | 实现任务       |
| `/opsx:archive` | 归档变更       |

详见 [AGENTS.md](../AGENTS.md) 和 [openspec/specs/](../openspec/specs/)。
