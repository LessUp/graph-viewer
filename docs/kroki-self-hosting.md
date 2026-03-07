# Kroki 自建与 GraphViewer 集成指南

> 本文描述 **当前仓库对 Kroki 的接入方式**，包括固定服务端配置和前端自定义服务器配置。

## 1. 当前支持的两种接入方式

GraphViewer 的远程渲染统一通过 `/api/render` 完成，目前支持两种 Kroki 来源：

- **方式 A：服务端固定 Kroki 地址**
  - 通过环境变量 `KROKI_BASE_URL` 配置
  - 这是默认方式
- **方式 B：前端设置面板指定自定义 Kroki 地址**
  - 用户在设置面板中输入 `renderServerUrl`
  - 由前端通过 `krokiBaseUrl` 传给 `/api/render`
  - 服务端会进一步校验是否允许该地址

## 2. 默认行为

如果你不做额外配置：

- `/api/render` 默认使用：

```text
https://kroki.io
```

这意味着：

- Mermaid / Flowchart / Graphviz 在满足本地渲染条件时优先本地渲染
- PlantUML、D2、Nomnoml 等远程引擎会走默认 Kroki

## 3. 方式 A：通过环境变量固定使用自建 Kroki

### 3.1 本地开发

在项目根目录创建或更新 `.env.local`：

```env
KROKI_BASE_URL=http://localhost:8000
```

然后启动：

```bash
npm run dev
```

### 3.2 Docker 直接运行 Kroki

```bash
docker run -d --name kroki -p 8000:8000 yuzutech/kroki
```

启动后，本机可访问：

```text
http://localhost:8000
```

### 3.3 Docker Compose

仓库当前 `docker-compose.yml` 提供：

- `web-dev`（dev，宿主机 `3000`）
- `web`（prod，宿主机 `3000`）
- `web-test`（test，宿主机 `3001`）
- `kroki`（宿主机 `8000`）

开发环境示例：

```bash
$env:KROKI_BASE_URL='http://kroki:8000'
docker compose --profile dev --profile kroki up
```

生产环境示例：

```bash
$env:KROKI_BASE_URL='http://kroki:8000'
docker compose --profile prod --profile kroki up -d
```

## 4. 方式 B：允许前端设置面板指定自定义 Kroki 地址

### 4.1 前端行为

当前 UI 已支持：

- 打开设置面板
- 开启“自定义渲染服务器”
- 输入 `https://kroki.example.com` 这样的地址
- 保存后，前端会在调用 `/api/render` 时附带 `krokiBaseUrl`

### 4.2 服务端安全限制

服务端 **不会默认接受任意客户端地址**。

当前支持两种放开方式：

#### 方式 1：允许任意客户端地址（风险更高）

```env
KROKI_ALLOW_CLIENT_BASE_URL=true
```

#### 方式 2：只允许白名单地址（推荐）

```env
KROKI_CLIENT_BASE_URL_ALLOWLIST=https://kroki.example.com,http://kroki:8000
```

### 4.3 地址被拒绝时的表现

如果前端传入的地址未被允许，`/api/render` 会返回：

- `KROKI_BASE_URL_NOT_ALLOWED`

如果地址本身非法，则会返回：

- `INVALID_KROKI_BASE_URL`

## 5. 验证步骤

建议至少验证以下场景：

### 5.1 固定服务端 Kroki

- 设置 `KROKI_BASE_URL`
- 启动应用
- 用 PlantUML 或其他远程引擎渲染一个图表
- 确认预览正常

### 5.2 前端自定义服务器

- 在设置面板中开启“自定义渲染服务器”
- 输入一个被服务端允许的地址
- 重新渲染远程引擎图表
- 确认请求成功

### 5.3 拒绝分支

- 输入一个未在 allowlist 中的地址
- 重新渲染
- 确认前端获得明确错误提示

## 6. 推荐实践

- **个人本地开发**
  - 直接用 `.env.local` + 本地 Kroki 容器
- **团队内网 / 测试环境**
  - 优先使用 `KROKI_CLIENT_BASE_URL_ALLOWLIST`
  - 不要直接对所有客户端开放任意地址
- **生产环境**
  - 优先使用固定的 `KROKI_BASE_URL`
  - 在反向代理层补 HTTPS、访问控制和日志策略

## 7. 常见问题

### 问题 1：PlantUML 仍然走公共 Kroki

- 检查 `KROKI_BASE_URL` 是否真正注入到运行环境
- 检查容器内是否能访问 `http://kroki:8000`

### 问题 2：设置面板填了地址但不生效

- 检查是否开启了“自定义渲染服务器”开关
- 检查服务端是否允许客户端传入该地址

### 问题 3：返回 `KROKI_BASE_URL_NOT_ALLOWED`

- 将目标地址加入 `KROKI_CLIENT_BASE_URL_ALLOWLIST`
- 或在可控环境下显式开启 `KROKI_ALLOW_CLIENT_BASE_URL=true`
