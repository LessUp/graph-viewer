# 开发与架构指南

> 本文描述 **当前仓库实现**。如果与历史规划文档冲突，以当前代码和本文为准。

## 1. 技术栈

- Next.js 15（App Router）
- React 19
- TypeScript（strict）
- Tailwind CSS
- CodeMirror（`@uiw/react-codemirror`）
- Mermaid / Graphviz WASM 本地渲染
- Kroki 远程渲染
- Vitest + Testing Library

## 2. 目录与职责

- `app/page.tsx`
  - 页面容器
  - 组合编辑器、预览、工作区列表、AI 助手、版本历史、设置弹窗
- `app/api/render/route.ts`
  - 统一渲染入口
  - 校验 `engine / format / code`
  - 代理 Kroki
  - 处理超时、错误映射、短期缓存、并发去重
- `app/api/healthz/route.ts`
  - 健康检查接口
- `components/`
  - `EditorPanel.tsx`：编辑区、引擎/格式选择、操作按钮
  - `PreviewPanel.tsx`：SVG / PNG / PDF 预览、缩放、平移、全屏
  - `PreviewToolbar.tsx`：导出与缩放工具栏
  - `DiagramList.tsx` / `CollapsedSidebar.tsx`：工作区图表列表与折叠态
  - `AppHeader.tsx`：工作区导入/导出、设置入口
  - `AIAssistantPanel.tsx` / `VersionHistoryPanel.tsx`：AI 与历史侧栏
- `hooks/`
  - `useDiagramState.ts`：工作区图表状态、URL / localStorage 恢复、持久化
  - `useDiagramRender.ts`：本地渲染、远程渲染、下载、错误状态
  - `useSettings.ts`：设置持久化（自定义渲染服务器、侧边栏状态）
  - `useToast.ts`：全局提示
  - `useAIAssistant.ts`：AI 配置与分析/生成/修复流程
  - `useVersionHistory.ts`：版本快照管理
- `lib/`
  - `diagramConfig.ts`：合法引擎、格式、标签、渲染能力定义
  - `diagramSamples.ts`：示例代码
  - `exportUtils.ts`：SVG / PNG / HTML / Markdown / 源码导出与 PNG 剪贴板

## 3. 核心数据流

### 3.1 工作区与编辑状态

- 图表工作区对象结构保持为：
  - `{ id, name, engine, format, code, updatedAt }`
- `useDiagramState` 负责：
  - 从 URL 查询参数恢复 `engine / format / code`
  - 从 `localStorage` 恢复工作区与当前图表
  - 首次 hydration 后初始化默认文档
  - 在状态变化后同步写回 `localStorage`

### 3.2 渲染链路

1. `app/page.tsx` 将 `engine / format / code` 传给 `useDiagramRender`
2. 当满足本地渲染条件时：
   - Mermaid / Flowchart + `svg`
   - Graphviz + `svg`
3. 本地渲染失败或当前格式不支持本地渲染时，回退到 `/api/render`
4. `/api/render` 根据 `engine` 映射 Kroki 类型，并按 `format` 返回：
   - `svg`：文本 SVG
   - `png` / `pdf`：base64 数据
5. `PreviewPanel` 根据当前格式选择渲染方式：
   - `svg`：安全清洗后内联显示
   - `png`：base64 图片显示
   - `pdf`：iframe 预览

### 3.3 自定义渲染服务器

- 设置入口：`SettingsModal.tsx`
- 状态来源：`useSettings.ts`
- `app/page.tsx` 仅在 `useCustomServer=true` 时把 `renderServerUrl` 传给 `useDiagramRender`
- `/api/render` 会进一步校验客户端传入的 `krokiBaseUrl`
- 若服务端未允许该地址，会返回 `KROKI_BASE_URL_NOT_ALLOWED`

### 3.4 导出链路

- 工具栏实现位于 `PreviewToolbar.tsx`
- 导出能力由 `lib/exportUtils.ts` 提供
- 当前 UI 下，导出菜单依赖 **SVG 预览内容**：
  - 如果当前格式是 `png` / `pdf`，导出菜单会不可用
  - 需要切回 `svg` 后再导出 SVG / PNG / HTML / Markdown / 源码
- 支持的导出动作：
  - SVG 文件
  - PNG 2x / 4x
  - HTML 文件
  - Markdown 文件
  - 源码文件
  - 复制 PNG 到剪贴板

## 4. 环境变量

- `KROKI_BASE_URL`
  - 默认远程渲染服务地址
  - 默认值：`https://kroki.io`
- `KROKI_ALLOW_CLIENT_BASE_URL`
  - 是否允许客户端通过设置面板传入任意 `krokiBaseUrl`
  - 仅在确有需要时开启
- `KROKI_CLIENT_BASE_URL_ALLOWLIST`
  - 允许客户端传入的 Kroki 地址白名单
  - 多个值可用逗号或空白分隔
- `NEXT_PUBLIC_GRAPHVIZ_WASM_BASE_URL`
  - Graphviz WASM 资源地址
- `PORT`
  - 服务端口，默认 `3000`

## 5. 常用命令

```bash
npm install
npm run dev
npm run build
npm run start
npm run lint
npm run test
npm run test:watch
npm run test:smoke
npm run bench
```

## 6. Docker / Compose

- `docker-compose.yml` 当前提供：
  - `web`（prod，宿主机 `3000`）
  - `web-dev`（dev，宿主机 `3000`）
  - `web-test`（test，宿主机 `3001`）
  - `kroki`（可选，自建 Kroki，宿主机 `8000`）
- 健康检查接口：`/api/healthz`

## 7. 当前测试基线

- 单元/组件测试：Vitest + Testing Library
- 当前已有测试覆盖：
  - `lib/diagramConfig.ts`
  - `hooks/useDiagramState.ts`
  - `components/AppHeader.tsx`
  - `app/api/healthz/route.ts`
- 冒烟测试：`scripts/smoke-test.js`
  - 当前验证 `healthz`、`render-svg`、`render-png`

## 8. 改动时的联动检查

如果你修改以下能力，请至少同步检查这些文件：

- **引擎 / 格式能力**
  - `lib/diagramConfig.ts`
  - `lib/diagramSamples.ts`
  - `hooks/useDiagramRender.ts`
  - `app/api/render/route.ts`
  - `components/EditorPanel.tsx`
  - `components/PreviewPanel.tsx`
  - `app/page.tsx`
- **工作区导入导出**
  - `components/AppHeader.tsx`
  - `hooks/useDiagramState.ts`
  - 相关测试文件
- **导出行为**
  - `components/PreviewToolbar.tsx`
  - `lib/exportUtils.ts`
  - `docs/EXPORT_IMPROVEMENTS.md`
- **测试能力**
  - `vitest.config.ts`
  - `vitest.setup.ts`
  - `docs/TESTING_GUIDE.md`

## 9. 常见问题

- **Graphviz WASM 加载失败**
  - 检查 `NEXT_PUBLIC_GRAPHVIZ_WASM_BASE_URL` 是否可访问
- **Kroki 渲染失败**
  - 检查 `KROKI_BASE_URL` 是否可达
  - 检查输入语法和 `format`
- **自定义渲染服务器不生效**
  - 检查服务端是否允许客户端传入 `krokiBaseUrl`
- **导出菜单不可用**
  - 当前只有在 SVG 预览可用时才可打开导出菜单
