# 架构重构与功能增强

**日期**：2025-11-18

## 变更内容

### 架构设计
- 新增重构设计文档 `docs/refactor-plan-2025-11-18.md`，梳理组件拆分方案与实施阶段

### 核心模块抽取
- **`lib/diagramConfig.ts`**：集中维护 Engine / Format 类型、集合、标签及 Kroki 类型映射；暴露 `isEngine`、`isFormat`、`getKrokiType`、`canUseLocalRender` 等辅助方法
- **`lib/diagramSamples.ts`**：集中存放各引擎示例代码
- **`hooks/useDiagramState.ts`**：管理 engine、format、code 与 codeStats，负责 URL Query 与 localStorage 的恢复 / 持久化
- **`hooks/useDiagramRender.ts`**：封装本地渲染（Mermaid / Graphviz）、远程渲染、下载逻辑与 AbortController

### UI 组件拆分
- **`components/EditorPanel.tsx`**：编辑器左侧区域（引擎 / 格式选择、按钮、代码编辑区与错误展示）
- **`components/PreviewPanel.tsx`**：右侧预览区域（引擎 / 格式标签、加载态、空态、SVG / PNG / PDF 预览）
- 重写 `app/page.tsx`，仅保留布局与组件组合逻辑

### `/api/render` 加固
- 改用 `diagramConfig` 进行引擎与格式校验
- 新增 `MAX_CODE_LENGTH`（100,000 字符）限制，超长请求返回 413
- 新增 Kroki 请求超时控制（`KROKI_TIMEOUT_MS`，10s），超时返回 504
- 修复 binary 下载时未写入缓存的问题，SVG / PNG / PDF 共用同一缓存
- 增加基础日志输出（engine / format / 长度摘要）

### 编辑体验增强
- 代码编辑区新增"复制代码""清空代码""格式化缩进"按钮
- 预览区域显示当前引擎与格式标签
- 代码编辑区新增行数与字符统计

### 前端错误提示优化
- 渲染与下载失败时展示中文友好信息，附带 HTTP 状态码与 Kroki 返回的 details

### 状态持久化
- 使用 localStorage 记住最近一次的渲染配置（engine / format / code），页面刷新时自动恢复

### 分享功能
- 新增"复制分享链接"：将当前 engine / format / code 写入 URL 查询参数，支持通过链接恢复图形配置

### 安全与文档
- Mermaid 本地渲染启用 `securityLevel: 'strict'`
- 更新 `README.md`：补充架构总览与"安全说明"章节

### Kroki 自建方案
- `docker-compose.yml` 新增可选 `kroki` 服务（profile `kroki`），不影响默认行为
- 新增文档 `docs/kroki-self-hosting.md`

## 影响范围
- **新增文件**：`diagramConfig.ts`、`diagramSamples.ts`、`useDiagramState.ts`、`useDiagramRender.ts`、`EditorPanel.tsx`、`PreviewPanel.tsx`、`docs/refactor-plan-2025-11-18.md`、`docs/kroki-self-hosting.md`
- **修改文件**：`app/page.tsx`、`app/api/render/route.ts`、`docker-compose.yml`、`README.md`
