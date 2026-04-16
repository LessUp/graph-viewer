# 安装指南

GraphViewer 的完整安装说明。

## 系统要求

| 组件 | 最低要求 | 推荐配置 |
|------|---------|---------|
| Node.js | 20.0.0 | 22.0.0 LTS |
| npm | 10.0.0 | 11.6.0+ |
| 内存 | 4GB | 8GB |
| 磁盘 | 1GB 空闲 | 2GB 空闲 |

## 标准安装

### 步骤 1：克隆仓库

```bash
git clone https://github.com/LessUp/graph-viewer.git
cd graph-viewer
```

### 步骤 2：安装依赖

```bash
npm install
```

这将安装所有必需的依赖，包括：
- Next.js 15 框架
- React 19 和 React DOM
- Mermaid、Graphviz WASM 等渲染引擎
- CodeMirror 编辑器组件
- 测试工具（Vitest、Testing Library）

### 步骤 3：环境配置（可选）

为本地开发创建 `.env.local` 文件：

```env
# Kroki 远程渲染服务（默认: https://kroki.io）
KROKI_BASE_URL=https://kroki.io

# 服务端口（默认: 3000）
PORT=3000

# Graphviz WASM 基础 URL（默认使用 CDN）
NEXT_PUBLIC_GRAPHVIZ_WASM_BASE_URL=https://unpkg.com/@hpcc-js/wasm/dist
```

### 步骤 4：验证安装

运行开发服务器：

```bash
npm run dev
```

在浏览器中打开 `http://localhost:3000`。

## 生产构建

### 带 API 路由的构建

用于需要服务端渲染的部署：

```bash
npm run build
npm start
```

### 静态导出

用于 GitHub Pages 或静态托管：

```bash
npm run build:static
```

输出将在 `dist/` 目录中。

## Docker 安装

### 使用 Docker Compose

```bash
# 生产环境配合自建 Kroki
docker compose --profile prod --profile kroki up -d

# 开发环境
docker compose --profile dev up
```

### 直接使用 Docker

```bash
# 构建镜像
docker build -t graph-viewer .

# 运行容器
docker run -p 3000:3000 -e KROKI_BASE_URL=https://kroki.io graph-viewer
```

## 故障排除

### 端口已被占用

```bash
# 使用不同端口
npm run dev -- -p 3001
```

### 权限错误（Linux/macOS）

```bash
# 修复 npm 权限
sudo chown -R $(whoami) ~/.npm
```

### Node.js 版本不匹配

使用 Node 版本管理器：

```bash
# nvm
nvm install 22
nvm use 22

# fnm
fnm install 22
fnm use 22
```
