# 极致 GitHub Pages 部署

本文档介绍 GitHub Pages 部署的极致优化方案。

## 🚀 优化特性

### 1. 极速构建
- **多层缓存**：node_modules、Next.js 缓存、构建产物
- **缓存命中优化**：缓存命中时构建速度提升约 80%
- **并行作业**：验证、构建和检查并行运行

### 2. 激进资源优化
- **Gzip 压缩**：所有资源使用 Level 9 压缩
- **Brotli 压缩**：为现代浏览器提供 Quality 11 压缩
- **代码压缩**：JSON、HTML 空白移除
- **关键 CSS 提取**：内联关键样式

### 3. 性能监控
- **Lighthouse CI**：自动化性能审计
- **链接验证**：坏链检测
- **构建统计**：大小跟踪和报告

### 4. 安全头配置
- **自定义响应头**：Cache-Control、安全策略
- **CSRF 防护**：Frame 选项、XSS 保护

## 📊 工作流架构

```
触发（推送到 master）
    ↓
[预检查] → 跳过检测
    ↓
[验证] → 类型检查、代码检查、测试
    ↓
[构建] → 优化静态构建
    │
    ├─→ [Lighthouse CI] → 性能审计
    └─→ [链接检查] → 链接验证
    ↓
[部署] → GitHub Pages
    ↓
[通知] → 状态报告
```

## ⚡ 构建优化

### 缓存策略

| 缓存类型 | 键值 | 存活时间 | 加速效果 |
|----------|------|----------|----------|
| node_modules | package-lock.json 哈希 | 永久 | 60s → 5s |
| Next.js 缓存 | 构建文件 + 配置 | 直到变更 | 提速 40% |
| GitHub 缓存 | 工作流 + 操作系统 | 7 天 | 并行恢复 |

### 代码分割优化

```javascript
// 优化的代码块分组
{
  reactCore: 40,    // React 核心库
  mermaid: 30,      // Mermaid（较大）
  codemirror: 25,   // CodeMirror 编辑器
  ui: 20,           // UI 组件
  vendor: 10,       // 其他供应商
  common: 5,        // 共享代码
}
```

## 🔧 配置

### 环境变量

```yaml
env:
  NODE_VERSION: '22'          # 最新 LTS
  FORCE_COLOR: '1'            # 彩色输出
  NEXT_TELEMETRY_DISABLED: '1' # 禁用遥测
  GITHUB_PAGES: 'true'        # 启用静态导出
```

### 触发条件

```yaml
on:
  push:
    branches: [master, main]
    paths:
      - 'app/**'
      - 'components/**'
      - 'hooks/**'
      - 'lib/**'
      - 'public/**'
      - 'package.json'
      - '.github/workflows/pages.yml'
```

## 📈 性能目标

| 指标 | 目标 | 优先级 |
|------|------|--------|
| 首次内容绘制 (FCP) | < 2.0s | 警告 |
| 最大内容绘制 (LCP) | < 2.5s | 警告 |
| 可交互时间 (TTI) | < 3.5s | 警告 |
| 累积布局偏移 (CLS) | < 0.1 | 警告 |
| 总阻塞时间 (TBT) | < 300ms | 警告 |
| 可访问性 | > 90 | 错误 |
| 最佳实践 | > 90 | 警告 |
| SEO | > 90 | 警告 |

## 🛠️ 手动部署

### 使用优化构建

```bash
# 安装依赖
npm ci

# 运行优化构建
npm run build:optimized

# 或使用标准静态构建
npm run build:static
```

### 部署到 GitHub Pages

```bash
# 工作流会在推送时自动部署
git push origin master

# 或手动触发
git commit --allow-empty -m "[trigger-deploy]"
git push
```

## 🆘 紧急部署

跳过验证检查以进行紧急修复：

```bash
# 通过 GitHub UI
# 1. 进入 Actions → Deploy to GitHub Pages
# 2. 点击 "Run workflow"
# 3. 选择 "skip_checks: true"
```

## 📊 监控

### 构建统计

访问构建统计：
- 部署站点中的 `/.build-stats.json`
- GitHub Actions 日志
- 产物下载

### Lighthouse 报告

临时公共存储：
- 在工作流产物中可用
- PR 评论（如果配置了 LHCI_GITHUB_APP_TOKEN）

## 🔐 安全考虑

### 内容安全策略

通过 `_headers` 文件应用的响应头：
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

### 缓存策略

```
JS/CSS:  max-age=31536000, immutable
SVGs:    max-age=86400
HTML:    max-age=0, must-revalidate
```

## 📝 故障排除

### 构建失败

1. 检查日志中的缓存状态
2. 验证 Node.js 版本兼容性
3. 检查循环依赖

### 部署失败

1. 确认 GitHub Pages 已启用
2. 检查分支保护规则
3. 检查部署日志

### 性能问题

1. 查看 Lighthouse CI 报告
2. 检查包分析器输出
3. 验证压缩已启用

## 🎯 未来增强

- [ ] 边缘部署（Cloudflare Pages）
- [ ] 增量静态再生
- [ ] 图片优化 CDN
- [ ] 真实用户监控 (RUM)
- [ ] A/B 测试框架
