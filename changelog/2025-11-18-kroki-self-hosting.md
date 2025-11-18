# 2025-11-18 Kroki 自建方案

- 更新 `docker-compose.yml`：
  - 新增可选服务 `kroki`（image `yuzutech/kroki`），使用 profile `kroki` 管理生命周期，不改变现有 `web`/`web-dev`/`web-test` 默认行为。
  - 保持 `KROKI_BASE_URL=${KROKI_BASE_URL:-https://kroki.io}`，通过设置 `KROKI_BASE_URL=http://kroki:8000` 即可让 GraphViewer 在容器网络中使用自建 Kroki。
- 新增文档 `docs/kroki-self-hosting.md`：
  - 说明自建 Kroki 的用途和基本原理。
  - 提供本地 `docker run` 与 `docker compose` 两种开发环境集成方式。
  - 描述生产环境（含 Docker Compose）与托管平台（如 Netlify）如何通过 `KROKI_BASE_URL` 切换到自建 Kroki 实例。
