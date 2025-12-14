# GraphViewer 开发待办清单（TODO）

> 说明：
> - 使用 Markdown 复选框记录任务完成情况（`[ ]` 未完成，`[x]` 已完成）。
> - 标签约定：
>   - 优先级：`[P1]` 高、`[P2]` 中、`[P3]` 低。
>   - 模块：`[frontend]`、`[backend]`、`[devops]`、`[docs]` 等。
> - 实际开发中可以自由增删、细化任务。

---

## 一、阶段 1：编辑器与预览体验升级（优先）

### 1.1 编辑器改造

- [ ] [P1][frontend] 选定代码编辑器方案（CodeMirror 或 Monaco），调研并记录优缺点
- [ ] [P1][frontend] 将 `EditorPanel` 中的 `textarea` 替换为代码编辑器组件
- [ ] [P1][frontend] 为 Mermaid / PlantUML / Graphviz / Flowchart 等语法配置基础高亮
- [ ] [P1][frontend] 支持行号、缩进、括号匹配、搜索等基础编辑功能

### 1.2 编辑快捷键与交互

- [ ] [P1][frontend] 在页面中实现 `Ctrl+Enter` 触发渲染预览
- [ ] [P2][frontend] 在页面中实现 `Ctrl+S` 触发本地保存 / 导出（或弹出提示）
- [ ] [P2][frontend] 在编辑器中支持 Tab/Shift+Tab 缩进操作

### 1.3 预览区体验

- [ ] [P1][frontend] 为 SVG 预览区域增加缩放功能（Zoom in/out 按钮）
- [ ] [P1][frontend] 支持鼠标拖拽平移大图
- [ ] [P2][frontend] 增加“适配屏幕（Fit to screen）”按钮
- [ ] [P2][frontend] 为 PNG/PDF 预览增加基本样式与出错提示

### 1.4 实时预览模式（可选）

- [ ] [P2][frontend] 在 UI 中增加“实时预览”开关
- [ ] [P2][frontend] 实现基于防抖（如 500–1000 ms）的自动渲染逻辑
- [ ] [P3][frontend] 在 README 或 docs 中说明实时预览的性能影响和建议使用方式

### 1.5 分享链接与状态

- [ ] [P1][frontend] 使用压缩方案（如 LZ + Base64）缩短 URL 中 `code` 的长度
- [ ] [P2][frontend] 为无法解析分享链接的情况增加友好错误提示
- [ ] [P2][docs] 在 README 中补充“分享链接长度与限制、压缩原理简单说明”

---

## 二、阶段 2：稳定性与工程化打磨

### 2.1 测试体系

- [ ] [P1][backend] 选型并配置测试框架（Vitest 或 Jest）
- [ ] [P1][backend] 为 `lib/diagramConfig.ts` 编写单元测试（引擎/格式校验、本地渲染支持、Kroki 类型映射）
- [ ] [P1][backend] 为 `app/api/render/route.ts` 编写单元测试：
  - 正常渲染（svg/png/pdf）
  - 超长代码被拒绝
  - Kroki 返回错误 / 超时时的响应
- [ ] [P2][backend] 给 hooks（`useDiagramState`、`useDiagramRender`）增加基础测试（可选）

### 2.2 代码质量与规范

- [ ] [P1][devops] 引入 ESLint（Next.js 官方推荐规则）
- [ ] [P1][devops] 引入 Prettier，并与 ESLint 协调（避免规则冲突）
- [ ] [P1][devops] 在 `package.json` 中新增脚本 `lint` 和 `lint:fix`
- [ ] [P2][devops] 在文档中简要说明代码风格（如何运行 lint、格式化）

### 2.3 部署与脚本优化

- [ ] [P1][devops] 修正 `scripts/deploy.sh` 中 `ENV=test` 时的健康检查端口（与 `docker-compose.yml` 保持一致）
- [ ] [P2][devops] 优化 Dockerfile：使用 `COPY package*.json ./` 并考虑 `npm ci` 提升构建稳定性
- [ ] [P2][devops] 在 docs 中记录本地使用 docker-compose 进行 dev/test/prod 部署的推荐流程

---

## 三、阶段 3：高级功能与生产化准备

### 3.1 多图 / 项目管理

- [ ] [P1][frontend] 设计“多图”数据结构（名称、引擎、更新时间等）
- [ ] [P1][frontend] 在 UI 中增加多 Tab 或图列表切换
- [ ] [P2][frontend] 支持将多图状态持久化到 localStorage 或 IndexedDB

### 3.2 模板库

- [ ] [P2][frontend] 设计模板配置结构（可基于现有 `SAMPLES` 扩展）
- [ ] [P2][frontend] 增加常见模板：业务流程、系统架构、时序图、状态机等
- [ ] [P2][frontend] 在 UI 中增加“从模板新建”入口
- [ ] [P3][docs] 在文档中列出内置模板清单和示例截图（可选）

### 3.3 导入 / 导出

- [ ] [P2][frontend] 支持从本地文件导入 `.mmd` / `.puml` / `.dot` 源文件
- [ ] [P2][frontend] 支持一键导出当前图源代码为对应扩展名文件
- [ ] [P3][docs] 在 README 中补充导入/导出功能的使用说明

### 3.4 分享与协作扩展（可选）

- [ ] [P3][backend] 设计并实现 `/api/share` 接口，保存 code 为短 ID
- [ ] [P3][frontend] 支持通过分享 ID 恢复图形代码
- [ ] [P3][docs] 在文档中说明分享 ID 的存储方式与保留策略

---

## 四、阶段 4：运维与安全治理

### 4.1 CI / CD

- [ ] [P2][devops] 使用 GitHub Actions / GitLab CI 搭建基础流水线：
  - 安装依赖 → lint → test
- [ ] [P2][devops] 在 CI 流程中增加对测试环境的冒烟测试（使用 `scripts/smoke-test.js`）

### 4.2 监控与日志

- [ ] [P3][backend] 选型错误追踪工具（如 Sentry），集成到前后端
- [ ] [P3][backend] 优化 `/api/render` 日志格式为结构化日志（JSON），便于集中收集

### 4.3 安全增强

- [ ] [P3][frontend] 调研并实现可选的 SVG 清洗逻辑（白名单标签/属性）
- [ ] [P3][docs] 在 README 中补充安全说明：
  - 当前默认适用于自用/内部环境
  - 如需在公网开放，建议开启额外安全措施（反向代理、限流、鉴权等）

---

## 五、日常使用建议

- 每次迭代前，从本文件中选出 3–7 条任务作为一轮迭代目标，避免范围过大。
- 做完某个任务后，及时将对应项从 `[ ]` 改为 `[x]`，保持清单干净、可视。
- 如果在开发过程中发现新的需求或问题，可以直接在对应阶段下面新增条目，并按优先级打标签。
