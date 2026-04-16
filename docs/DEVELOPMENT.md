# GraphViewer 开发与架构指南

> 本文档描述当前仓库实现。如有冲突，以代码为准。

## 技术栈

| 技术 | 版本 |
|------|------|
| Next.js | 15 |
| React | 19 |
| TypeScript | strict |
| Node.js | 22 |
| Tailwind CSS | 3.x |
| CodeMirror | @uiw/react-codemirror |
| Mermaid | 10.x |
| Vitest | 2.x |

## 目录结构

```
├── app/
│   ├── page.tsx              # 主页面，组合所有组件
│   ├── layout.tsx            # 根布局
│   └── api/
│       ├── render/route.ts   # Kroki 代理渲染
│       └── healthz/route.ts  # 健康检查
├── components/
│   ├── EditorPanel.tsx       # 编辑区
│   ├── PreviewPanel.tsx      # 预览区
│   ├── PreviewToolbar.tsx    # 导出工具栏
│   ├── DiagramList.tsx       # 图表列表
│   ├── SidebarTabs.tsx       # 侧边栏 Tab
│   ├── AppHeader.tsx         # 页头
│   ├── SettingsModal.tsx     # 设置弹窗
│   ├── AIAssistantPanel.tsx  # AI 助手
│   ├── VersionHistoryPanel.tsx # 版本历史
│   └── ...
├── hooks/
│   ├── useDiagramState.ts    # 工作区状态
│   ├── useDiagramRender.ts   # 渲染逻辑
│   ├── useLivePreview.ts     # 实时预览
│   ├── useSettings.ts        # 设置持久化
│   ├── useVersionHistory.ts  # 版本历史
│   ├── useAIAssistant.ts     # AI 功能
│   └── ...
├── lib/
│   ├── diagramConfig.ts      # 引擎/格式定义
│   ├── diagramSamples.ts     # 示例代码
│   ├── exportUtils.ts        # 导出工具
│   ├── syntaxHighlight.ts    # CodeMirror 语言映射
│   └── types.ts              # 类型定义
├── docs/                     # 文档
├── changelog/                # 变更日志
└── scripts/
    ├── smoke-test.js         # 冒烟测试
    └── ...
```

## 核心数据流

### 渲染链路

```
useDiagramState (state + LocalStorage + URL)
    ↓
page.tsx
    ├── EditorPanel ← code input
    ├── PreviewPanel ← render output
    └── ...
    ↓
useLivePreview (debounced)
    ↓
useDiagramRender
    ├── 本地渲染 (Mermaid/Graphviz WASM)
    └── 远程渲染 → POST /api/render → Kroki
```

### 工作区状态

- 图表对象：`{ id, name, engine, format, code, updatedAt }`
- 存储位置：`localStorage`（key: `graphviewer:state:v1`）
- URL 分享：`?engine=&format=&code=&encoded=1`

## 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `KROKI_BASE_URL` | `https://kroki.io` | 远程渲染服务 |
| `KROKI_ALLOW_CLIENT_BASE_URL` | - | 允许客户端自定义 Kroki 地址 |
| `KROKI_CLIENT_BASE_URL_ALLOWLIST` | - | 客户端 Kroki 地址白名单 |
| `NEXT_PUBLIC_GRAPHVIZ_WASM_BASE_URL` | CDN | Graphviz WASM 资源 |
| `PORT` | `3000` | 服务端口 |

## 常用命令

```bash
# 开发
npm run dev

# 构建
npm run build           # 完整构建
npm run build:static    # 静态导出

# 测试
npm run test
npm run test:watch
npm run test:smoke

# 代码质量
npm run lint
npm run typecheck
npm run format

# 基准测试
npm run bench
```

## Docker 部署

```bash
# 生产环境
docker compose --profile prod up -d

# 开发环境
docker compose --profile dev up

# 带自建 Kroki
docker compose --profile prod --profile kroki up -d
```

## 测试覆盖

| 模块 | 测试文件 |
|------|----------|
| diagramConfig | `lib/__tests__/diagramConfig.test.ts` |
| useDiagramRender | `hooks/__tests__/useDiagramRender.test.tsx` |
| useDiagramState | `hooks/__tests__/useDiagramState.test.tsx` |
| useVersionHistory | `hooks/__tests__/useVersionHistory.test.tsx` |
| AppHeader | `components/__tests__/AppHeader.test.tsx` |
| PreviewPanel | `components/__tests__/PreviewPanel.test.tsx` |
| /api/render | `app/api/render/route.test.ts` |
| /api/healthz | `app/api/healthz/route.test.ts` |

## 变更联动检查

修改以下能力时，需同步检查：

### 引擎/格式

`diagramConfig.ts` → `diagramSamples.ts` → `syntaxHighlight.ts` → `exportUtils.ts` → `useDiagramRender.ts` → `render/route.ts` → `EditorPanel.tsx` → `PreviewPanel.tsx` → `page.tsx`

### 工作区导入导出

`AppHeader.tsx` → `useDiagramState.ts` → 相关测试

### 导出行为

`PreviewToolbar.tsx` → `exportUtils.ts`
