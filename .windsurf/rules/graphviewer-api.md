---
trigger: glob
globs:
  - app/api/**/*.ts
---

# GraphViewer API 路由规则

## 路由约定

- 所有 API 路由使用 `runtime = 'nodejs'` 和 `dynamic = 'force-dynamic'`。
- 优先返回 `NextResponse`，保留当前的缓存、超时、错误映射策略。
- 错误响应使用中文 `error` 字段，便于前端直接展示。

## render 路由 (`app/api/render/route.ts`)

这是最关键的 API 路由，负责 Kroki 代理渲染：

- 引擎白名单通过 `isEngine()` 校验，新增引擎时必须同步更新 `lib/diagramConfig.ts`。
- 包含内存缓存（TTL 120s、最大 200 条）和 in-flight 请求去重。
- Kroki 请求超时 10s（`KROKI_TIMEOUT_MS`）。
- 代码长度上限 100KB（`MAX_CODE_LENGTH`）。
- 修改缓存策略或超时参数时，注意对高并发场景的影响。

## healthz 路由 (`app/api/healthz/route.ts`)

- 健康检查端点，Docker 和 Netlify 部署依赖此端点。
- 保持简单，只返回 `{ status: 'ok' }`。

## 通用规则

- `catch` 块使用 `catch (e: unknown)` + `instanceof Error` 收窄。
- 不要在 API 路由中引入浏览器 API 或 `'use client'`。
- 新增 API 路由时，在 `app/api/<name>/` 目录下创建 `route.ts`，同时创建 `route.test.ts`。
