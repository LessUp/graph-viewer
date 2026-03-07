---
trigger: always_on
---

# GraphViewer 项目规则

- 技术栈：
  - Next.js App Router
  - React 19
  - TypeScript 严格模式
  - Tailwind CSS
- 优先复用现有核心模块，不要平行引入第二套状态流或渲染/导出逻辑：
  - `useDiagramState`
  - `useDiagramRender`
  - `useSettings`
  - `useToast`
  - `lib/diagramConfig.ts`
- `engine` 和 `format` 只能使用 `lib/diagramConfig.ts` 中定义的合法值，不要在业务代码里引入魔法字符串。
- 工作区图表对象结构必须保持兼容：
  - `{ id, name, engine, format, code, updatedAt }`
- 修改图表引擎、格式或导出能力时，必须同步检查：
  - `lib/diagramConfig.ts`
  - `lib/diagramSamples.ts`
  - `hooks/useDiagramRender.ts`
  - `app/api/render/route.ts`
  - `components/EditorPanel.tsx`
  - `components/PreviewPanel.tsx`
  - `app/page.tsx`
- UI 文案优先保持中文，与现有界面风格一致。
- 优先在现有组件上做小步修改，不要为了单点需求额外创建新的顶层页面结构或全局状态层。
