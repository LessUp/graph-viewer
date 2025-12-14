# GraphViewer 内网版开发路线图（docker-compose 部署）

> 本路线图面向 **公司内网部署场景**，假设：
> - 使用 `docker-compose` 在内网服务器上部署 GraphViewer；
> - 可访问公司内网 Docker Registry / npm 源；
> - 暂不对接集中监控平台，主要依赖容器健康检查与日志；
> - 近期的首要目标是：**先能在内网一键跑起来（MVP）**，后续再渐进完善功能与工程化。

本文件与根目录下的通用 `ROADMAP.md` 互补：

- `ROADMAP.md`：偏通用产品演进路线（编辑体验、工程化、CI/CD 等）。
- `ROADMAP-intranet.md`：专门针对“公司内网 + docker-compose 部署”的落地路径。
- 配套清单：`TODO-intranet.md`，按阶段拆分为可执行任务。

---

## 1. 当前基线与约束

### 1.1 功能基线

基于当前代码与文档，GraphViewer 已具备：

- **图形语法支持**：Mermaid、Flowchart.js、PlantUML、Graphviz。
- **渲染模式**：
  - 浏览器本地：Mermaid + Graphviz WASM，输出 SVG；
  - 服务端代理：`/api/render` 调用 Kroki 渲染 `svg/png/pdf`。
- **状态与分享**：
  - URL Query + LZ 压缩分享；
  - `localStorage` 持久化当前引擎/格式/代码。
- **容器与部署**：
  - `Dockerfile`：基于 Next.js standalone 输出，非 root 用户运行，内置 `/api/healthz` 健康检查；
  - `docker-compose.yml`：
    - `web`（prod profile）：生产镜像；
    - `web-dev`（dev profile）：开发容器；
    - `web-test`（test profile）：测试镜像；
    - `kroki`（kroki profile）：自建 Kroki 服务；
  - `docs/kroki-self-hosting.md`：详细 Kroki 自建与集成指南。

### 1.2 内网环境约束（本路线图假设）

- 内网服务器上安装了 Docker / docker-compose；
- 服务器可以访问公司内部镜像仓库和 npm 源；
- 是否能访问公网 **不做强依赖**，但后续会尽量消除对公网 CDN 的依赖；
- 不接入公司统一监控平台，观察主要依靠：
  - 容器健康检查（`HEALTHCHECK` / compose `healthcheck`）；
  - 应用日志（控制台 / 容器日志）。

---

## 2. 阶段规划概览

为避免“一步到位的过度设计”，采用渐进式路线：

- **阶段 0：内网最小可用版（MVP，可安装可用）**  
  目标：在纯内网环境，通过 `docker-compose` 一条命令即可拉起 GraphViewer + Kroki，自测三种语法渲染与下载。

- **阶段 1：团队协作与产品化体验（可选，后续）**  
  目标：从“单用户工具”演进到“团队图形工作台”，引入多图管理、模板库、导入导出、短链接分享等。

- **阶段 2：工程化与质量保障（可选，后续）**  
  目标：补齐测试、lint、CI、简单发布流程，让内网版的迭代更可控。

- **阶段 3：安全与内网规范增强（可选，后续）**  
  目标：根据公司安全规范，加强 SVG/XSS 安全、简单审计日志、必要的访问控制等。

具体任务请参考 `TODO-intranet.md`，本文件偏宏观规划与验收标准。

---

## 3. 阶段 0：内网最小可用版（MVP）

### 3.1 阶段目标

在一台内网服务器上，满足：

1. 使用 `docker-compose` 同时拉起 **GraphViewer（web）+ 自建 Kroki**；
2. 在浏览器中访问内网地址（例如 `http://intranet-host:3000`），可以：
   - 选择 Mermaid / PlantUML / Graphviz 等引擎；
   - 编辑图形代码并成功渲染预览；
   - 下载 SVG/PNG/PDF 文件；
3. 关键渲染路径**不依赖公网服务的可用性**：
   - Kroki 部署在内网；
   - Graphviz WASM 优先使用本地静态资源（如仍需访问公网，应在 `TODO-intranet.md` 中明确为已知风险）。

### 3.2 主要工作内容

对应 `TODO-intranet.md` 中的「阶段 0」任务，主要包括：

- **docker-compose 基线梳理**
  - 验证 `docker-compose.yml` 中 `web`（prod）与 `kroki` 服务的协同工作；
  - 固化一条推荐命令，例如：
    - `KROKI_BASE_URL=http://kroki:8000 docker compose --profile prod --profile kroki up -d`；
  - 可选：提供 `.env.intranet.example`，统一管理 `KROKI_BASE_URL` / `PORT` 等环境变量。

- **Kroki 自建与内网联调**
  - 基于现有 `docs/kroki-self-hosting.md`，给出**内网部署最小流程**版本；
  - 确认 `web` 容器能通过 `http://kroki:8000` 正常调用 Kroki；
  - 在内网环境完成一次端到端验证（Mermaid / PlantUML / Graphviz）。

- **去公网依赖（能改则改，改不了则记录）**
  - 优先将 Graphviz WASM 的 `wasmFolder` 指向自身静态资源目录，避免访问 jsDelivr 等公网 CDN；
  - 若短期内确实需要公网访问，需在文档中标明前提（例如：服务器能访问公网且已评估风险）。

- **内网部署文档与验证清单**
  - 在 `docs/` 下补充《内网部署快速开始》：
    - 环境前提（Docker / docker-compose 版本、磁盘/内存建议）；
    - 一条命令拉起服务；
    - 如何更新镜像 / 回滚；
  - 在 `ROADMAP-intranet.md` 中维护阶段 0 的「验收 Checklist」。

### 3.3 阶段 0 验收标准

当满足以下条件时，可认为阶段 0 完成：

1. 在一台新内网服务器上，只需：

   ```bash
   git clone ...
   cd GraphViewer
   cp .env.intranet.example .env   # 可选
   # 或直接在命令行传入 KROKI_BASE_URL
   KROKI_BASE_URL=http://kroki:8000 docker compose --profile kroki --profile prod up -d
   ```

   即可拉起 GraphViewer + Kroki。

2. 从浏览器访问 `http://<内网服务器 IP>:3000` 可以：

   - 使用 Mermaid、PlantUML、Graphviz 三种语法编辑并成功渲染预览；
   - 成功下载对应的 SVG/PNG/PDF；
   - 刷新页面后仍保留最近编辑记录（依赖 `localStorage`）。

3. 在关闭服务器外网（或通过抓包/日志验证）后：

   - 图形渲染主要依赖内网 Kroki 与本地 WASM，不再强依赖公网服务的可用性。

---

## 4. 阶段 1：团队协作与产品化体验（可选，后续）

> 本阶段不影响“先能在内网跑起来”，旨在将 GraphViewer 演进为适合**团队日常使用**的图形工作台。

### 4.1 阶段目标

- 从“单图工具 + URL 分享”的形态升级为：
  - 支持多图 / 项目管理；
  - 提供模板库、导入/导出能力；
  - 提供更友好的分享与协作方式（如短链接）。

### 4.2 主要工作方向（高层）

对应 `TODO-intranet.md` 中「阶段 1」任务：

- 多图 / 项目管理：
  - 定义项目/图的元数据结构（名称、标签、更新时间、所属人等）；
  - 设计 UI（侧边栏列表、多 Tab 等）；
  - 选择存储方式（内网部署时建议引入后端存储，而不是仅靠浏览器 `localStorage`）。

- 模板库：
  - 扩展 `lib/diagramSamples.ts` 为可配置模板集；
  - 支持系统模板 + 团队自定义模板；
  - 在 UI 中提供“从模板新建”的入口。

- 导入 / 导出：
  - 导入：上传 `.mmd` / `.puml` / `.dot` 文本文件；
  - 导出：一键导出当前图或项目全部图的源文件/打包文件；
  - 内部数据格式与前端状态打通，便于备份与迁移。

- 分享与协作（内网）：
  - 设计 `/api/share` 接口，保存图代码为短 ID；
  - 通过 `/g/{id}` 或 Query ID 恢复图形；
  - 后续可考虑简单的只读/可编辑权限。

---

## 5. 阶段 2：工程化与质量保障（可选，后续）

> 当内网使用稳定后，建议逐步补齐工程化能力，降低后续迭代风险。

### 5.1 阶段目标

- 建立基础测试/规范/CI：
  - 修改关键逻辑不再“拍脑袋上生产”；
  - 引入 lint + 格式化规范；
  - 有一条最小 CI 流水线支撑内网部署。

### 5.2 主要工作方向（高层）

- 测试体系：
  - 单元测试：优先覆盖 `lib/diagramConfig.ts`、`app/api/render/route.ts`、`useDiagramState`、`useDiagramRender`；
  - 冒烟测试：基于 `scripts/smoke-test.js`，对内网部署实例做基本可用性检查。

- 代码规范：
  - 引入 ESLint（Next 官方推荐配置）和 Prettier；
  - 在 `package.json` 中增加 `lint` / `lint:fix` 脚本；
  - 在 CI 中强制通过 lint + test。

- CI / 发布流程：
  - 在公司 Git 平台（GitLab CI / Jenkins / GitHub Actions 等）上配置：
    - 安装依赖 → lint → test → 构建镜像 → 推送到内网镜像仓库；
  - 内网服务器从镜像仓库拉取新版本并滚动更新。

---

## 6. 阶段 3：安全与内网规范增强（可选，后续）

> 根据公司安全与合规要求，逐步加强安全能力。

### 6.1 阶段目标

- 降低潜在 XSS / 数据泄露风险；
- 满足公司关于日志、访问控制的基本规范。

### 6.2 主要工作方向（高层）

- SVG/XSS 安全：
  - 评估是否需要在前端引入 SVG 白名单清洗逻辑；
  - 配置 Mermaid 的 `securityLevel` 等安全选项（当前已使用 `strict`，可继续评估）。

- 访问控制（轻量版）：
  - 内网环境通常基于“网络边界安全”，但仍可考虑：
    - 简单的访问令牌或基础认证（如给生产实例加一层反向代理 Basic Auth）。

- 日志与审计（轻量版）：
  - 在 `/api/render` 等关键接口输出结构化日志（不包含原始图代码，只记录引擎、格式、长度、错误状态等）；
  - 将重要操作日志集中到公司日志服务（如未来有需要时）。

---

## 7. 使用本路线图的建议

- **阶段优先级**：
  - 近期：聚焦阶段 0，先让内网 docker-compose 部署“真正可用”；
  - 中期：根据使用反馈，从 `TODO-intranet.md` 的阶段 1/2 中挑选任务逐步实现；
  - 远期：在公司安全/合规有要求时，再推进阶段 3。

- **迭代方式**：
  - 每次迭代从 `TODO-intranet.md` 中选出 3–7 条任务，保证 1–2 周内可以完成；
  - 阶段 0 完成后，建议先做一轮内部试用收集反馈，再决定阶段 1 的具体范围。

- **文档维护**：
  - 若实际路线与本文件有调整（例如跳过某些阶段），建议直接在本文件中按日期记录变更原因；
  - 与根目录的通用 `ROADMAP.md` 保持联动，避免信息割裂。
