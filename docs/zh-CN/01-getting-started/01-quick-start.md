# 快速开始

在 5 分钟内启动并运行 GraphViewer。

## 环境要求

- **Node.js**: 20 或更高版本 ([下载](https://nodejs.org/))
- **npm**: 10 或更高版本（随 Node.js 一起安装）
- **Git**: 用于克隆仓库

验证您的环境：

```bash
node --version  # v20.0.0 或更高
npm --version   # 10.0.0 或更高
```

## 安装步骤

### 1. 克隆仓库

```bash
git clone https://github.com/LessUp/graph-viewer.git
cd graph-viewer
```

### 2. 安装依赖

```bash
npm install
```

### 3. 启动开发服务器

```bash
npm run dev
```

应用将在 `http://localhost:3000` 可用。

## 第一步

1. **创建您的第一个图表**
   - 选择图表引擎（例如 Mermaid）
   - 从下拉菜单选择一个示例
   - 点击"渲染预览"

2. **导出您的图表**
   - 点击预览工具栏中的导出按钮
   - 选择 SVG、PNG (2x/4x)、HTML 或 Markdown 格式

3. **分享您的作品**
   - 点击"分享"生成压缩 URL
   - 复制链接与他人分享

## 下一步

- 了解[支持的图表引擎](../04-features/02-rendering.md)
- 探索[导出选项](../04-features/01-export.md)
- 设置 [Docker 部署](../03-deployment/01-docker.md)
