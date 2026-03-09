---
trigger: glob
globs:
  - Dockerfile
  - docker-compose.yml
  - netlify.toml
  - next.config.js
  - package.json
  - tsconfig.json
  - tailwind.config.js
  - postcss.config.js
  - .eslintrc.json
  - .env.example
---

# GraphViewer 基础设施与配置规则

## 依赖管理 (`package.json`)

- 新增依赖后确认 `package-lock.json` 同步更新。
- 不要随意升级 Next.js 或 React 大版本，除非需求明确要求。
- 开发工具（lint、test、format）放在 `devDependencies`。

## TypeScript (`tsconfig.json`)

- 保持严格模式（`strict: true`）。
- 路径别名 `@/` 指向项目根目录，不要引入其他别名。

## 构建配置 (`next.config.js`)

- 修改后运行 `npm run build` 验证。
- 注意 SSR / Edge 兼容性，`app/api/` 路由使用 `runtime = 'nodejs'`。

## Docker (`Dockerfile` + `docker-compose.yml`)

- `Dockerfile` 使用多阶段构建（deps → build → runtime）。
- 修改依赖后检查 `COPY package*.json` 步骤是否需要更新。
- `docker-compose.yml` 包含 4 个 profile：`prod`、`dev`、`test`、`kroki`。
- 健康检查依赖 `/api/healthz` 端点。

## Netlify (`netlify.toml`)

- 构建命令和 Node.js 版本定义在此文件。
- 修改构建流程时同步更新。

## 环境变量 (`.env.example`)

- 新增环境变量时必须同步更新 `.env.example`。
- 不要在代码中硬编码密钥或敏感信息。
