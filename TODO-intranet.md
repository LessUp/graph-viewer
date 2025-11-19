# GraphViewer 内网版开发待办清单（TODO）

> 说明：
> - 本清单面向“公司内网 + docker-compose 部署”场景。
> - 主要服务于本仓库的 `ROADMAP-intranet.md`，按阶段拆分任务。
> - 使用 Markdown 复选框标记任务完成情况：`[ ]` 未完成，`[x]` 已完成。
> - 标签约定：
>   - 优先级：`[P1]` 高、`[P2]` 中、`[P3]` 低；
>   - 模块：`[frontend]`、`[backend]`、`[devops]`、`[docs]`、`[security]` 等。

---

## 一、阶段 0：内网最小可用版（MVP）

> 目标：在一台内网服务器上，使用 `docker-compose` 一条命令即可拉起 GraphViewer + 自建 Kroki，并完成三种语法的图形编辑、预览与下载。尽量减少对公网依赖，先保证“可安装、可用”。

### 1.1 docker-compose 基线与环境准备

- [ ] [P1][devops] **验证现有 `docker-compose.yml` 的 prod + kroki 启动流程**  
  - 在本地或测试内网环境执行：
    - `KROKI_BASE_URL=http://kroki:8000 docker compose --profile kroki --profile prod up -d`；
  - 确认：
    - `web` 容器正常启动并通过 `HEALTHCHECK`；
    - `kroki` 容器正常启动，端口映射为宿主机 `8000:8000`。

- [ ] [P1][devops] **整理内网部署所需环境前提**  
  在 `docs/` 或 `README` 中简单说明：
  - 必要软件：Docker 版本、docker-compose 版本；
  - 推荐机器配置：CPU/内存/磁盘的最小建议；
  - 网络前提：是否需要访问公司内网镜像仓库 / npm 源等。

- [ ] [P2][devops] **提供 `.env.intranet.example` 示例文件**  
  示例内容包括：
  - `KROKI_BASE_URL=http://kroki:8000`
  - `PORT=3000`
  - 其他常用环境变量（如需要）。

### 1.2 Kroki 自建与联调

- [ ] [P1][devops] **基于现有文档，在内网服务器上实际拉起 Kroki**  
  - 可使用：

    ```bash
    docker compose --profile kroki up -d kroki
    ```

  - 或单独 `docker run` 的方式（参考 `docs/kroki-self-hosting.md`）。

- [ ] [P1][backend] **确认 `/api/render` 在设置 `KROKI_BASE_URL=http://kroki:8000` 时工作正常**  
  - 调用 `/api/render` 手工构造一次请求（Mermaid / PlantUML / Graphviz 任一）；
  - 确认返回 SVG/PNG/PDF，且日志中无明显错误。

- [ ] [P2][docs] **在《内网部署快速开始》中加入 Kroki 一体化说明**  
  - 步骤：
    - 先启动 Kroki；
    - 再启动 GraphViewer，并将 `KROKI_BASE_URL` 指向 Kroki 容器；
  - 简述常见错误排查（Kroki 端口、网络连通性等）。

### 1.3 去除或弱化公网依赖

> 目标是在条件允许的情况下减少对公网服务（尤其是 CDN）的依赖，或者在文档中明确前提与风险。

- [ ] [P1][frontend] **Graphviz WASM 资源内网化设计**  
  当前代码中：

  - `@hpcc-js/wasm` 使用 `wasmFolder('https://cdn.jsdelivr.net/npm/@hpcc-js/wasm/dist')` 指向公网 CDN。

  任务：

  - 设计调整方案，将 WASM 静态文件打包到应用静态资源目录（如 Next 静态资源）或挂载到容器内路径；
  - 将 `wasmFolder` 改为相对路径（如 `/static/wasm/@hpcc-js/wasm`），确保内网可用。

- [ ] [P2][devops] **验证 Graphviz 本地渲染在无公网环境下可用**  
  - 在隔离环境（不能访问公网）中启动服务；
  - 打开 Graphviz 示例图，确认本地渲染可以正常出图；
  - 如暂时无法实现完全内网化，应在文档中明确“Graphviz 本地渲染目前仍需访问公网 CDN”。

- [ ] [P2][docs] **在内网部署文档中标记公网依赖清单**  
  - 列出：
    - 当前仍需访问的公网域名（如未完全去除）；
    - 风险提示与可选替代方案。

### 1.4 内网部署与回归验证

- [ ] [P1][devops] **制定一套“从零到可用”的标准部署步骤**  
  在文档中给出类似流程：

  ```bash
  git clone <company-git>/GraphViewer.git
  cd GraphViewer
  cp .env.intranet.example .env   # 如采用 .env 方式
  docker compose --profile kroki --profile prod up -d
  ```

- [ ] [P1][devops] **在内网浏览器中完成一次完整手工回归**  
  回归项包括：
  - Mermaid 示例：编辑 → 预览 → 下载 SVG/PNG；
  - PlantUML 示例：编辑 → 预览 → 下载 PDF；
  - Graphviz 示例：编辑 → 预览（本地 WASM） → 下载 SVG；
  - 切换引擎/格式，页面刷新后仍能保留最近编辑代码。

- [ ] [P2][devops] **可选：封装简单的 `scripts/deploy-intranet.sh`**  
  - 脚本内封装：加载 `.env` → 启动 Kroki + web → 打印访问 URL；
  - 用于降低手工敲命令的出错率。

### 1.5 文档与验收记录

- [ ] [P1][docs] **在 `docs/` 下创建《内网部署快速开始》文档**  
  - 包含：环境前提、部署步骤、常见问题；
  - 引用：`docs/kroki-self-hosting.md` 中的 Kroki 细节。

- [ ] [P2][docs] **在 `ROADMAP-intranet.md` 中补充阶段 0 验收 Checklist 与完成日期**  
  - 当阶段 0 完成时，记录：
    - 完成时间；
    - 实际部署环境（服务器规格、Docker 版本等）；
    - 发现的遗留问题（如仍有公网依赖等）。

---

## 二、阶段 1：团队协作与产品化体验（后续）

> 目标：在内网 MVP 可用的基础上，将 GraphViewer 演进为适合团队日常使用的图形工作台。

### 2.1 多图 / 项目管理

- [ ] [P1][frontend] 设计“项目 / 图”的数据模型与 UI 草图  
  - 字段建议：`id`、`name`、`engine`、`updatedAt`、`owner`、`tags` 等；
  - UI 形态：侧边栏列表、多 Tab、或项目列表页。

- [ ] [P1][backend] 设计并实现项目/图的持久化方案  
  - 选择存储方式：
    - 轻量场景：SQLite / 文件存储；
    - 重量场景：接入公司内网数据库（如 MySQL/PostgreSQL）。

- [ ] [P1][frontend] 实现基础多图管理功能  
  - 新建 / 重命名 / 删除图；
  - 在项目内切换当前图；
  - 将现有单图编辑页面升级为“当前选中图编辑界面”。

- [ ] [P2][frontend] 支持搜索与过滤  
  - 按名称、引擎、标签等筛选图；
  - 可以在图较多时快速定位。

### 2.2 模板库

- [ ] [P2][frontend] 扩展 `lib/diagramSamples.ts` 为模板配置模块  
  - 区分：系统内置模板 / 团队自定义模板；
  - 允许按类别分组：架构图、时序图、流程图等。

- [ ] [P2][frontend] 在 UI 中增加“从模板新建”入口  
  - 在新建图弹窗中选择模板；
  - 在编辑器附近提供“应用模板”或“查看模板列表”。

- [ ] [P3][docs] 编写模板示例与最佳实践文档  
  - 给出几套常用的公司内部架构/流程模板，方便推广。

### 2.3 导入 / 导出

- [ ] [P2][frontend] 支持从本地文件导入 `.mmd` / `.puml` / `.dot` 等文本文件  
  - 在项目或图列表页中提供“导入”入口；
  - 解析文件内容并创建/覆盖图。

- [ ] [P2][frontend] 支持导出当前图/项目为本地文件  
  - 导出单图：源代码文件；
  - 导出项目：打包为 zip，包含所有图的源文件与一个清单 JSON。

- [ ] [P3][docs] 在文档中补充导入/导出使用说明与注意事项  
  - 文件编码、换行符、命名规范等。

### 2.4 内网分享与协作

- [ ] [P2][backend] 设计并实现 `/api/share` 短链接 API  
  - 将图代码/配置保存为短 ID；
  - 返回形如 `/g/{id}` 或 `?shareId={id}` 的短链接。

- [ ] [P2][frontend] 在 UI 中提供“复制内部短链接”按钮  
  - 替代或补充当前的长 URL 分享方式；
  - 适配公司内部 IM / 邮件等场景。

- [ ] [P3][backend] 设计简单访问权限（可选）  
  - 例如：仅登录用户可访问；
  - 或限制在公司 VPN / 内网 IP 范围内访问（通过反向代理实现）。

---

## 三、阶段 2：工程化与质量保障（后续）

> 目标：补齐测试、lint、CI 等工程能力，让内网版 GraphViewer 的演进更可控。

### 3.1 测试体系

- [ ] [P1][backend] 选型并接入测试框架（Vitest 或 Jest）  
  - 为后端 `/api/render`、前端 hooks (`useDiagramState`/`useDiagramRender`) 提供单元测试支撑。

- [ ] [P1][backend] 为 `lib/diagramConfig.ts` 编写单元测试  
  - 覆盖：引擎/格式校验、本地渲染支持判断、Kroki 类型映射。

- [ ] [P1][backend] 为 `app/api/render/route.ts` 编写单元测试  
  - 正常渲染（svg/png/pdf）；
  - 超长代码被拒绝；
  - Kroki 返回错误/超时时的处理逻辑。

- [ ] [P2][frontend] 为 `useDiagramState` / `useDiagramRender` 编写基础测试（可选）  
  - 覆盖：状态初始化、URL & localStorage 恢复、本地渲染回退逻辑等。

- [ ] [P2][devops] 扩展 `scripts/smoke-test.js` 用于内网部署实例的冒烟测试  
  - 至少验证首页可访问、基础渲染 API 可用。

### 3.2 代码规范与 CI

- [ ] [P1][devops] 引入 ESLint（Next.js 官方推荐配置）  
  - 在 `package.json` 中增加 `lint` 脚本。

- [ ] [P1][devops] 引入 Prettier 并与 ESLint 协调  
  - 增加 `lint:fix` 或 `format` 脚本；
  - 在文档中简单说明格式化约定。

- [ ] [P2][devops] 在公司 CI 平台上配置基础流水线  
  - 步骤：安装依赖 → `npm run lint` → `npm test`（如已引入）→ `npm run build`；
  - 构建并推送 Docker 镜像到内网镜像仓库（如有）。

- [ ] [P2][docs] 编写《开发与提交流程说明》  
  - 包括：如何跑测试、如何处理 CI 失败、分支策略等。

---

## 四、阶段 3：安全与内网规范增强（后续）

> 目标：在公司安全/合规要求下，逐步增强 SVG/XSS 安全、日志与访问控制能力。

### 4.1 SVG / XSS 安全

- [ ] [P1][security] 评估当前 SVG 注入方式的风险  
  - 结合公司安全规范审查 `dangerouslySetInnerHTML` 使用场景；
  - 评估 Mermaid / Graphviz 输出的 SVG 是否需要进一步清洗。

- [ ] [P2][frontend] 可选：引入 SVG 白名单清洗逻辑  
  - 对 Kroki 或本地渲染返回的 SVG 进行标签/属性白名单过滤；
  - 在配置中提供开关（默认根据场景选择开启/关闭）。

### 4.2 访问控制与审计（轻量）

- [ ] [P2][backend] 设计轻量访问控制方案（可选）  
  - 如通过反向代理层实施 IP 白名单 / Basic Auth；
  - 或在应用层加入简单的访问令牌校验。

- [ ] [P2][backend] 在关键操作路径打日志（登录、图创建/修改/删除、导出等）  
  - 日志内容不含原始图代码，仅记录摘要信息；
  - 使用 JSON 格式便于后续接入日志平台。

- [ ] [P3][docs] 在文档中说明日志与隐私策略  
  - 明确记录哪些信息、用途是什么、保留时间等。

---

## 五、阶段 4：日常运维与推广（持续）

> 目标：让运维和使用方都“敢用”、“爱用”。

- [ ] [P3][docs] 编写《运维手册》  
  - 包含：启动/停止、查看日志、升级/回滚、常见故障处理建议。

- [ ] [P3][docs] 编写《用户使用手册》  
  - 面向普通研发/文档同学，介绍常见用法、模板示例、导入导出等。

- [ ] [P3][docs] 准备内部分享或培训材料  
  - 示例场景：架构评审图、测试流程图、线上排障流程图等；
  - 收集试点团队反馈，更新路线图与 TODO 清单。
