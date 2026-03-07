# 测试指南

> 本文描述 **当前测试体系**。如果与历史导出测试说明冲突，以当前脚本和测试文件为准。

## 1. 测试分层

当前项目有三类测试：

- **单元 / 组件测试**
  - 使用 Vitest + Testing Library
  - 适合验证 Hook、工具模块、组件行为
- **接口冒烟测试**
  - 使用 `scripts/smoke-test.js`
  - 适合验证部署后的基础可用性
- **手工回归测试**
  - 适合验证导出、剪贴板、Kroki、自定义服务器等浏览器相关行为

## 2. 前置条件

- Node.js 20+
- 首次运行先执行：

```bash
npm install
```

## 3. 自动化测试

### 3.1 运行全部测试

```bash
npm run test
```

### 3.2 监听模式

```bash
npm run test:watch
```

### 3.3 当前自动化测试覆盖

当前仓库已包含以下测试：

- `lib/__tests__/diagramConfig.test.ts`
- `hooks/__tests__/useDiagramState.test.tsx`
- `components/__tests__/AppHeader.test.tsx`
- `app/api/healthz/route.test.ts`

这些测试主要覆盖：

- 引擎 / 格式定义
- 工作区状态恢复与持久化
- 导入导出入口行为
- 健康检查接口

## 4. Lint 与测试建议执行顺序

推荐在修改业务代码后执行：

```bash
npm run lint
npm run test
```

如果只修改测试代码，通常至少执行：

```bash
npm run test
```

## 5. 冒烟测试

### 5.1 本地开发环境

先启动服务：

```bash
npm run dev
```

然后执行：

```bash
npm run test:smoke
```

默认目标地址：

```text
http://localhost:3000
```

### 5.2 指定目标地址

```bash
node scripts/smoke-test.js http://localhost:3000
```

如果是 `web-test` profile：

```bash
node scripts/smoke-test.js http://localhost:3001
```

### 5.3 当前冒烟测试覆盖

当前脚本会验证：

- `GET /api/healthz`
- `POST /api/render`（Mermaid SVG）
- `POST /api/render`（Mermaid PNG）

> 注意：当前冒烟脚本 **还没有覆盖 PDF**。

## 6. 手工回归检查清单

### 6.1 基础渲染

- Mermaid / Flowchart 在 `svg` 下可预览
- Graphviz 在 `svg` 下可本地渲染
- PlantUML / D2 / 其他远程引擎可通过 `/api/render` 预览
- `format` 在 `svg / png / pdf` 间切换正常

### 6.2 导出能力

在 **SVG 预览已生成** 的前提下检查：

- SVG 导出
- PNG 2x 导出
- PNG 4x 导出
- HTML 导出
- Markdown 导出
- 源代码导出
- 复制 PNG 到剪贴板

> 当前 UI 中，若预览格式切到 `png` 或 `pdf`，导出菜单会不可用；需要切回 `svg` 后再验证导出。

### 6.3 工作区与设置

- 工作区 JSON 导入 / 导出正常
- localStorage 中的当前图表、格式、代码可恢复
- 自定义 Kroki 服务器设置保存正常
- 未被服务端允许的自定义 Kroki 地址会返回明确错误

### 6.4 侧栏能力

- AI 助手面板可切换、分析、生成或修复代码
- 版本历史面板可创建快照、恢复、重命名、删除版本

## 7. 常见问题排查

### 问题 1：`npm run test` 失败

- 确认依赖已安装：`npm install`
- 确认测试环境仍使用 `vitest.config.ts` 和 `vitest.setup.ts`
- 若失败点与浏览器 API 相关，优先检查测试里是否显式 mock 了：
  - `localStorage`
  - `history.replaceState`
  - `File.text()`
  - `navigator.clipboard`

### 问题 2：冒烟测试报 `ECONNREFUSED`

- 目标服务未启动
- 默认地址错误
- 目标端口不匹配（例如 `web-test` 用的是 `3001`）

### 问题 3：复制到剪贴板失败

- 浏览器不支持 Clipboard API
- 不是安全上下文（推荐 `localhost` 或 HTTPS）
- 权限被拒绝

### 问题 4：自定义 Kroki 地址无效

- 地址不是合法 `http/https`
- 服务端未开启 `KROKI_ALLOW_CLIENT_BASE_URL`
- 或地址不在 `KROKI_CLIENT_BASE_URL_ALLOWLIST` 中

## 8. 建议补充的后续测试

优先建议继续覆盖：

- `app/api/render/route.ts`
- `hooks/useDiagramRender.ts`
- `components/PreviewPanel.tsx`
- `components/EditorPanel.tsx`
- 自定义 Kroki 地址允许 / 拒绝分支
