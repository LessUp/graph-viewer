# GraphViewer

一站式图形语法可视化工具，支持 Mermaid、PlantUML、Graphviz 等，提供本地与服务端混合渲染、容器化部署与自动化测试。

## 新功能
- 本地 Graphviz WASM 渲染（SVG）与 Mermaid 本地渲染，减少网络往返、提升响应速度。
- 服务端渲染结果短期缓存，降低重复渲染延迟与外部依赖压力。
- 容器化部署（多阶段构建、独立输出、健康检查），支持 dev/test/prod 多环境。
- 一键部署脚本与健康探针。
- 自动化冒烟测试与性能基准测试脚本。

## 快速开始
- 开发模式：
  - `npm install`
  - `npm run dev`
  - 打开 `http://localhost:3000`

## 部署指南
- 环境变量：
  - `KROKI_BASE_URL`：远程渲染服务地址（默认 `https://kroki.io`）
  - `PORT`：服务端口（默认 `3000`）

- 容器构建与运行：
  - 构建：`docker compose --profile prod build`
  - 启动：`docker compose --profile prod up -d`
  - 健康检查：`curl -fsS http://localhost:3000/api/healthz`

- 一键部署脚本：
  - dev 环境：`ENV=dev ./scripts/deploy.sh`
  - test 环境：`ENV=test ./scripts/deploy.sh`
  - prod 环境：`ENV=prod ./scripts/deploy.sh`

## 配置说明
- Next.js 独立输出：`next.config.js` 中启用 `output: 'standalone'`，构建产物用于最小化镜像。
- 健康检查端点：`/api/healthz`（app/api/healthz/route.ts）
- 渲染 API：`/api/render`（app/api/render/route.ts）
- 客户端渲染入口：`app/page.tsx`
 - 架构总览：
   - 前端：`app/page.tsx` + `components/*` + `hooks/*`，负责编辑、预览与状态持久化。
   - 后端：`/api/render` 作为 Kroki 代理与缓存层，`/api/healthz` 用于健康检查。
   - 配置：`lib/diagramConfig.ts` 统一维护引擎/格式，`lib/diagramSamples.ts` 存放示例代码。

## 安全说明
- 本地渲染：
  - Mermaid 使用 `securityLevel: 'strict'` 初始化，仅在浏览器内渲染 SVG，不向服务端发送代码。
  - Graphviz WASM 在浏览器侧执行，依赖 `@hpcc-js/wasm` 官方实现。
- 远程渲染：
  - `/api/render` 会将图形代码转发到 `KROKI_BASE_URL` 指定的 Kroki 实例（默认 `https://kroki.io`），并在内存中短期缓存结果；缓存仅用于性能优化，不做持久化存储。
  - 服务端日志不会记录原始代码内容，仅记录引擎、格式、长度和错误状态等摘要信息，用于排查故障。
- 使用建议：
  - 在涉及敏感业务逻辑或机密信息时，优先使用本地渲染（Mermaid / Graphviz），或配置自建 Kroki 实例替代公共服务。
  - 如需更严格的安全隔离，可在反向代理或前置网关层增加额外访问控制和日志策略。

## 测试与基准
- 冒烟测试：`npm run test:smoke`（默认访问 `http://localhost:3000`）
- 基准测试：`npm run bench`（支持环境变量 `APP_URL`、`N`）

## 许可
MIT