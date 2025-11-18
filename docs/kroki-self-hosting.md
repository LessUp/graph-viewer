# Kroki 自建与 GraphViewer 集成指南

本指南说明如何自建 Kroki 实例，并让 GraphViewer 使用该实例进行 PlantUML 等图形的远程渲染，以提升稳定性和控制数据流向。

## 1. 基本原理

GraphViewer 后端 `/api/render` 会将图形代码转发到 `KROKI_BASE_URL` 指定的 Kroki 实例：

- 未设置时默认使用公共服务 `https://kroki.io`。
- 设置为自建地址后，将改用你的 Kroki 实例，例如：`http://localhost:8000` 或 `http://kroki:8000`。

前端逻辑无需修改，只要正确配置环境变量即可。

---

## 2. 本地 Docker 自建 Kroki

### 2.1 直接运行 Kroki 容器

在本地终端执行：

```bash
docker run -d --name kroki \
  -p 8000:8000 \
  yuzutech/kroki
```

启动成功后，本机 Kroki 地址为：`http://localhost:8000`。

### 2.2 让本地 GraphViewer 指向自建 Kroki

#### 方式 A：直接 `npm run dev` 开发

1. 在项目根目录创建 `.env.local`（若已存在则追加）：

   ```env
   KROKI_BASE_URL=http://localhost:8000
   ```

2. 重新启动开发服务器：

   ```bash
   npm run dev
   ```

3. 打开 `http://localhost:3000`，切换到 PlantUML / 其他远程引擎进行预览，流量将通过本地 Kroki 实例。

#### 方式 B：使用 `docker-compose` 的 dev profile

`docker-compose.yml` 已内置一个可选的 `kroki` 服务（profile `kroki`），以及开发服务 `web-dev`：

1. 启动 GraphViewer + Kroki：

   ```bash
   KROKI_BASE_URL=http://kroki:8000 \
   docker compose --profile dev --profile kroki up
   ```

   - `kroki` 服务监听容器内 `8000` 端口，对外映射为宿主机 `8000`。
   - `web-dev` 容器通过 `http://kroki:8000` 访问 Kroki。

2. 打开浏览器访问 `http://localhost:3000` 即可使用自建 Kroki。

> 注意：不设置 `KROKI_BASE_URL` 时，GraphViewer 仍会回退到 `https://kroki.io`，dev/test/prod 行为保持向后兼容。

---

## 3. 测试与验证

建议在自建 Kroki 后按以下步骤验证：

1. **Mermaid/Flowchart**：
   - 使用默认示例代码，确认本地渲染正常。
2. **Graphviz**：
   - 使用示例 DOT 图，确认本地 WASM 渲染正常。
3. **PlantUML**：
   - 切换为 PlantUML，引擎选择 `plantuml`，使用示例状态图/时序图：
   - 点击“渲染预览”：
     - 正常时应快速获得 SVG/PNG/PDF 预览。
     - 如遇错误，请查看后端日志中 `/api/render` 的 `KROKI_ERROR` 或 `KROKI_TIMEOUT` 记录。

如 PlantUML 在使用公共 `https://kroki.io` 时经常失败，而在自建 Kroki 下恢复正常，则说明问题主要来自网络或公共服务稳定性。

---

## 4. 生产环境 / 其他环境集成

### 4.1 使用 Docker Compose 部署 GraphViewer + Kroki

假设你在服务器上使用 `docker-compose.yml` 的 `prod` profile：

1. 启动 Kroki：

   ```bash
   docker compose --profile kroki up -d kroki
   ```

2. 启动 GraphViewer：

   ```bash
   KROKI_BASE_URL=http://kroki:8000 \
   docker compose --profile prod up -d web
   ```

3. 对外暴露 `web` 服务端口（默认 3000），按需要配置反向代理或 TLS。

### 4.2 Netlify 等托管平台

对于 Netlify 这类托管平台，自建 Kroki 通常需要运行在其他可访问的服务器上，例如：

- 自己的 VPS / 云主机，运行 Kroki 容器并开放 80/443 或 8000 端口；
- 一个支持容器的 PaaS（Fly.io、Render 等）。

假设自建 Kroki 域名为 `https://kroki.example.com`，在 Netlify 后台：

1. 打开对应站点的 **Site settings → Environment variables**。
2. 新增或修改：

   - `KROKI_BASE_URL=https://kroki.example.com`

3. 重新部署站点。

部署完成后，GraphViewer 在 Netlify 环境中会使用你的自建 Kroki 实例进行 PlantUML / 其他远程渲染。

---

## 5. 运行维护建议

- **资源限制**：
  - 默认 Kroki 即可满足中小规模使用；如并发较高，可结合 Docker / K8s 做横向扩展。
- **安全与访问控制**：
  - 建议在自建 Kroki 前面加一层反向代理（nginx/Caddy），根据需要启用 HTTPS、IP 访问控制或身份验证。
- **监控与日志**：
  - 可结合反向代理与容器日志，观察请求量、错误率，必要时增加告警或限流策略。

通过以上配置，GraphViewer 可以在不修改业务代码的前提下，稳定地使用自建 Kroki 实例，特别是增强 PlantUML 渲染的可靠性与可控性。
