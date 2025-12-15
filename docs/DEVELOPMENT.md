# 开发者文档

## 架构概览
- 前端：`Next.js 15 (App Router)`、`React 19`、`Tailwind CSS`
- 运行时：Node.js 20
- 客户端渲染：Mermaid 与 Graphviz（WASM）用于 SVG 快速预览
- 服务端渲染：`/api/render` 通过 `Kroki` 远程渲染 Mermaid/PlantUML/Graphviz 的 `svg/png/pdf`
- 健康检查：`/api/healthz`

## 关键代码位置
- 页面入口：`app/page.tsx`
  - 本地渲染加载：`loadMermaid()` 与 `loadGraphviz()`
  - 预览触发：`renderDiagram()`、下载：`downloadDiagram()`
- 渲染 API：`app/api/render/route.ts`
  - 输入验证、远程调用、二进制返回、短期内存缓存
- 健康检查：`app/api/healthz/route.ts`

## 本地渲染细节
- Mermaid：动态导入 `mermaid` 并初始化；仅在 `engine ∈ {mermaid, flowchart}` 且 `format=svg` 时启用本地渲染
- Graphviz：动态导入 `@hpcc-js/wasm`，调用 `graphviz.load()` 后使用 `graphviz.layout(dot, 'svg', 'dot')`
- 失败回退：本地渲染失败时自动调用服务端 `/api/render`

## 服务端渲染缓存
- 基于 `engine|format|sha256(code)` 的 Key，内存缓存 `TTL=120s`
- `svg` 直接缓存文本，`png/pdf` 缓存 `base64`
- 额外治理：缓存上限 `MAX_CACHE_ENTRIES=200`，定期清理 `PRUNE_INTERVAL_MS=30s`
- 并发去重：同一 Key 的并发请求通过 `inflight` 合并，避免重复请求 Kroki

## 环境变量
- `KROKI_BASE_URL`：默认 `https://kroki.io`
- `PORT`：默认 `3000`
- `NODE_ENV`：`development|production`

## 启动与调试
- 安装依赖：`npm install`
- 开发启动：`npm run dev`，访问 `http://localhost:3000`
- 生产构建：`npm run build` → `.next/standalone` 输出；本地启动：`npm run start`

## 容器化
- Dockerfile：多阶段构建，拷贝 `.next/standalone` 与 `.next/static`，非 root 用户运行，`/api/healthz` 健康检查
- Compose Profiles：`dev|test|prod` 三套

## 测试与基准
- 冒烟测试：`npm run test:smoke`（需服务运行；支持 `APP_URL` 或 `node scripts/smoke-test.js <url>` 指定目标）
- 性能基准：`npm run bench`（支持 `APP_URL`、`N`）

## 代码风格与安全
- TypeScript/React 代码遵循现有模式，不引入未使用库
- 不提交任何密钥；外部服务通过环境变量配置

## 常见问题
- Graphviz WASM 加载失败：确认浏览器支持 WASM，网络允许加载打包内资源
- Kroki 渲染失败：检查 `KROKI_BASE_URL` 可达性与输入语法正确性