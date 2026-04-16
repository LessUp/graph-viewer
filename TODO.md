# GraphViewer 开发待办清单

> 标签约定：
> - 优先级：`[P1]` 高、`[P2]` 中、`[P3]` 低
> - 模块：`[frontend]`、`[backend]`、`[devops]`、`[docs]`

---

## 一、编辑器与预览体验

### 编辑器 ✅ 完成

- [x] [P1][frontend] 选定代码编辑器方案（CodeMirror）
- [x] [P1][frontend] 替换为代码编辑器组件
- [x] [P1][frontend] 配置语法高亮
- [x] [P1][frontend] 支持行号、缩进、括号匹配
- [x] [P1][frontend] `Ctrl+Enter` 触发渲染
- [x] [P2][frontend] `Ctrl+S` 导出源码

### 预览区 ✅ 完成

- [x] [P1][frontend] SVG 预览区域缩放
- [x] [P1][frontend] 鼠标拖拽平移
- [x] [P2][frontend] 适配屏幕按钮
- [x] [P2][frontend] PNG/PDF 预览样式与错误提示

### 实时预览 ✅ 完成

- [x] [P2][frontend] 实时预览开关
- [x] [P2][frontend] 防抖自动渲染

### 分享链接 ✅ 完成

- [x] [P1][frontend] LZ-string 压缩方案
- [x] [P2][frontend] 解码失败友好提示

---

## 二、稳定性与工程化

### 测试体系

- [x] [P1][backend] 配置 Vitest
- [x] [P1][backend] `lib/diagramConfig.ts` 单元测试
- [x] [P1][backend] `app/api/render/route.ts` 单元测试
- [x] [P2][backend] hooks 基础测试

### 代码质量 ✅ 完成

- [x] [P1][devops] 引入 ESLint
- [x] [P1][devops] 引入 Prettier
- [x] [P1][devops] 新增 lint 脚本

### 部署优化 ✅ 完成

- [x] [P1][devops] 修正 deploy.sh 健康检查端口
- [x] [P2][devops] 优化 Dockerfile
- [x] [P2][devops] Node.js 版本统一至 22

---

## 三、高级功能

### 多图管理 ✅ 完成

- [x] [P1][frontend] 多图数据结构
- [x] [P1][frontend] 图列表切换
- [x] [P2][frontend] localStorage 持久化

### 模板库

- [x] [P2][frontend] 设计模板配置结构
- [x] [P2][frontend] 增加常见模板
- [ ] [P2][frontend] "从模板新建"入口

### 导入导出 ✅ 完成

- [x] [P2][frontend] 导入源文件
- [x] [P2][frontend] 导出源码文件

---

## 四、运维与安全

### CI/CD ✅ 完成

- [x] [P2][devops] GitHub Actions 流水线
- [x] [P2][devops] CI 冒烟测试

### 安全 ✅ 完成

- [x] [P3][frontend] SVG 清洗（DOMPurify）
- [x] [P3][docs] 安全说明文档

---

## 五、待办事项

### 功能增强

- [ ] [P2][frontend] "从模板新建"入口
- [ ] [P3][backend] `/api/share` 短链接分享

### 运维增强

- [ ] [P3][backend] 结构化日志（JSON）
- [ ] [P3][backend] 错误追踪（Sentry）

### 文档

- [ ] [P3][docs] 内置模板清单与截图
