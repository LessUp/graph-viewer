---
trigger: always_on
---

# GraphViewer 项目规则

## 技术栈

- Next.js 15（App Router）+ React 19 + TypeScript（strict）+ Tailwind CSS
- Node.js 22（与 CI、Docker 保持一致）

## 核心模块复用

优先复用现有核心模块，不要平行引入第二套状态流或渲染/导出逻辑：

| 层级   | 模块                                                       |
| ------ | ---------------------------------------------------------- |
| 状态层 | `useDiagramState`、`useSettings`、`useToast`               |
| 渲染层 | `useDiagramRender`、`useLivePreview`                       |
| 动作层 | `useVersionActions`、`useWorkspaceActions`、`useAIActions` |
| 配置层 | `lib/diagramConfig.ts`、`lib/types.ts`                     |

## 类型约束

- `Engine` 和 `Format` 只能使用 `lib/diagramConfig.ts` 中定义的合法值
- 工作区图表对象 `DiagramDoc` 结构：`{ id, name, engine, format, code, updatedAt }`

## 引擎/格式/导出变更同步检查

修改图表引擎、格式或导出能力时，必须同步检查：

1. `lib/diagramConfig.ts` — 类型定义、ENGINE_CATEGORIES、getKrokiType
2. `lib/diagramSamples.ts` — 示例代码
3. `lib/syntaxHighlight.ts` — CodeMirror 语言映射
4. `lib/exportUtils.ts` — 导出格式映射
5. `hooks/useDiagramRender.ts` — 本地/远程渲染逻辑
6. `app/api/render/route.ts` — Kroki 代理、引擎白名单
7. `components/EditorPanel.tsx` — 引擎/格式选择器 UI
8. `components/PreviewPanel.tsx` — 预览渲染
9. `components/PreviewToolbar.tsx` — 导出入口
10. `app/page.tsx` — 顶层组合

## 编码风格

- UI 文案保持中文
- 优先在现有组件上做小步修改
- `catch` 块使用 `catch (e: unknown)` + `instanceof Error` 收窄

## 常用命令

```bash
npm run dev         # 开发服务器
npm run test        # 单元测试
npm run lint        # ESLint 检查
npm run typecheck   # TypeScript 检查
npm run build       # 生产构建
```
