# 依赖清理与文档重构

日期：2026-04-16

## 变更内容

### 依赖管理

- **新增缺失依赖**：`@codemirror/state` 和 `@codemirror/view` 已添加到 `package.json`，这两个包在 `lib/syntaxHighlight.ts` 和 `components/CodeEditor.tsx` 中被直接使用。
- **移除未使用依赖**：
  - `@codemirror/language`（未直接使用）
  - `@codemirror/legacy-modes`（未直接使用）
  - `@lezer/highlight`（未直接使用）
  - `@types/lz-string`（lz-string 已内置类型定义）
- **保留必要依赖**：`tailwindcss`、`postcss`、`autoprefixer`、`prettier-plugin-tailwindcss`、`@netlify/plugin-nextjs` 均在构建流程中使用，予以保留。

### Node.js 版本统一

- Dockerfile 更新为 `node:22-alpine`
- docker-compose.yml 中 `web-dev` 服务更新为 `node:22-alpine`
- 与 CI workflow（`.github/workflows/ci.yml`）和 Pages workflow（`.github/workflows/pages.yml`）中的 Node.js 22 保持一致

## 背景

项目依赖管理存在两个问题：

1. `depcheck` 报告缺失依赖和未使用依赖，影响依赖树的准确性
2. Docker 构建环境与 CI 环境的 Node.js 版本不一致，可能导致构建行为差异

## 验证

```bash
npm run test       # 48 测试通过
npm run lint       # 无 ESLint 错误
npm run typecheck  # 无 TypeScript 错误
npm run build      # 构建成功
```

## 影响

- 依赖数量从 655 个减少到 610 个
- 构建环境一致性提升
- Docker 镜像大小略有减小
