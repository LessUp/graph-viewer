# GraphViewer 重构设计方案

## 1. 背景与目标

GraphViewer 当前实现已经具备完整的核心能力：编辑图形语法、即时预览、文件下载以及通过 Kroki 渲染多种引擎（Mermaid、PlantUML、Graphviz、Flowchart）。随着功能的逐步丰富，`app/page.tsx` 和 `/api/render` 的复杂度在上升，需要一套简洁、可演进的重构方案。

本重构方案的目标是：

- **提高可维护性**：降低单文件复杂度，清晰划分前端组件和业务逻辑职责。
- **增强扩展性**：便于未来增加新的渲染引擎、输出格式或页面功能。
- **提升健壮性与安全性**：加强服务端防护（超时、输入限制、日志），提高前端渲染的安全性（SVG/XSS 相关）。
- **遵守 KISS 原则**：避免引入不必要的新框架或复杂基础设施，保持架构简单直接。

---

## 2. 现状概览

### 2.1 前端

- 使用 Next.js 15 App Router。
- 主要页面：`app/page.tsx`。
  - 集中承担以下职责：
    - UI 布局与样式渲染（TailwindCSS）。
    - 编辑器状态管理（`engine` / `format` / `code` 等）。
    - 本地渲染逻辑（Mermaid / Graphviz WASM）。
    - 远程渲染调用 `/api/render` 及错误处理。
    - 下载逻辑（本地生成 SVG 或从后端二进制下载）。
    - 状态持久化（URL Query + `localStorage`）。

### 2.2 后端

- API 路由：`app/api/render/route.ts`
  - 负责代理 Kroki：POST `{engine, format, code, binary}` → Kroki → 返回 JSON 或二进制。
  - 实现内存缓存（`Map + sha256(code)`），减少重复渲染请求，并包含缓存上限与定期清理。
  - 对同一 Key 的并发请求做合并（inflight 去重），避免重复请求 Kroki。
  - 增加输入长度限制与 Kroki 请求超时控制。
  - 对错误进行封装，向前端返回统一错误结构。
- 健康检查：`app/api/healthz/route.ts`（存在但不是本次重构重点）。

### 2.3 部署

- 使用 Netlify 部署，配置在 `netlify.toml`。
- `next.config.js`：
  - `reactStrictMode: true`。
  - `output: 'standalone'`。
  - 使用 `@netlify/plugin-nextjs` 进行集成。

---

## 3. 设计原则

- **KISS**：尽量通过组件拆分、抽取 Hook 和配置模块解决问题，避免过度工程化（不引入 Redux、复杂 DI 框架等）。
- **渐进式重构**：按阶段实施，每个阶段可单独上线、可回滚，避免一次性大改动。
- **行为无回归**：在重构过程中保持外部行为、接口契约不变（特别是 `/api/render` 的请求/响应结构）。
- **安全优先**：在 SVG 渲染、服务端代理等环节增加必要的安全防护，而不过度复杂化实现。

---

## 4. 目标架构设计

### 4.1 前端分层与组件拆分

#### 4.1.1 目标结构

目标是将当前单一的 `app/page.tsx` 拆分为：

- `app/page.tsx`
  - 作为页面级容器，负责：
    - 高层布局框架。
    - 注入业务 Hook（渲染、状态持久化）。
    - 组合下层组件。
- `components/EditorPanel.tsx`
  - 负责：
    - 渲染引擎和输出格式的选择。
    - 代码编辑区域（CodeMirror）。
    - 操作按钮（渲染预览、下载、复制分享链接、恢复示例、清空代码、格式化缩进等）。
  - 通过 props 接收：
    - `engine`, `format`, `code`。
    - `setEngine`, `setFormat`, `setCode`。
    - `onRender`, `onDownload`, `onCopyShareLink`, `onCopyCode` 等回调。
    - `loading`, `error`, `canUseLocalRender`, `codeStats` 等状态。
- `components/PreviewPanel.tsx`
  - 负责：
    - 根据 `format`, `svg`, `base64`, `contentType`, `loading` 显示预览区域。
    - 展示 loading skeleton、空状态、错误信息（如通过 props 传入）。

这样拆分后：

- UI 组件只关注“如何展示”，不关心“如何渲染图形”。
- 渲染流程（本地/远程）全部收敛到业务 Hook 中，页面组件变得更薄。

#### 4.1.2 业务 Hook 抽取

预期引入两个核心 Hook：

- `useDiagramState`
  - 职责：
    - 管理 `engine`, `format`, `code` 等核心状态。
    - 负责状态持久化：
      - 从 URL Query 恢复初始状态。
      - 若 URL 未指定，则从 `localStorage` 恢复。
      - 状态变更时同步写回 `localStorage`。
  - 对外暴露：
    - state：`engine`, `format`, `code`, `codeStats`。
    - setter：`setEngine`, `setFormat`, `setCode`。

- `useDiagramRender`
  - 职责：
    - 根据 `engine`, `format`, `code` 负责：
      - 本地渲染（Mermaid / Graphviz WASM）。
      - 远程渲染 `/api/render`（预览模式）。
      - 下载逻辑（本地或从 `/api/render` 获取二进制）。
      - 管理 `loading`, `error`, `svg`, `base64`, `contentType`。
      - 管理 `AbortController`，支持取消正在进行的渲染或下载。
    - 内部封装本地渲染和远程渲染的 fallback 逻辑：
      - 优先尝试本地渲染，失败时回退到后端。
      - 后端失败时，可根据需要再尝试本地渲染一次。
  - 对外暴露：
    - state：`svg`, `base64`, `contentType`, `loading`, `error`, `canUseLocalRender`, `showPreview`。
    - handlers：`renderDiagram`, `downloadDiagram`, `clearError` 等。

### 4.2 渲染引擎配置共享模块

目前前端和后端都维护了各自的 `engine` / `format` 集合和标签映射，存在一定重复。

计划新增一个轻量的配置模块，例如：

- `lib/diagramConfig.ts`
  - 定义：
    - `ENGINE_LIST` / `ENGINE_SET`。
    - `FORMAT_LIST` / `FORMAT_SET`。
    - `ENGINE_LABELS` / `FORMAT_LABELS`。
    - 每个引擎的特性描述：
      - 是否支持本地渲染。
      - 支持哪些输出格式。
      - 映射到 Kroki 时的类型（例如 `flowchart` → `mermaid`）。
  - 用法：
    - 前端：
      - 渲染下拉框选项、标签显示。
      - 计算 `canUseLocalRender`（根据引擎和格式）。
    - 后端：
      - 校验 `engine` / `format` 是否受支持。
      - 计算 Kroki 路径中的 `type` 和 `format`。

好处：

- 避免常量散落在多个文件中，减少未来扩展时漏改的风险。
- 让“引擎配置”成为一个独立关注点，更符合单一职责原则。

### 4.3 后端 `/api/render` 重构

在保持现有接口契约不变的前提下，重点强化健壮性与安全性：

#### 4.3.1 输入校验与保护

- 使用 `lib/diagramConfig` 中的 `ENGINE_SET` 与 `FORMAT_SET` 做统一校验。
- 增加对 `code` 的长度限制：
  - 例如约定最大字符数（如 50k 或 100k），超过直接返回 400，并提示“输入过长，请拆分”。
  - 避免单次请求消耗过多资源或被恶意滥用。
- 对 `binary` 字段：
  - 保持现有语义（JSON vs 二进制响应），暂不改 URL 结构，仅在内部抽象成两种模式处理函数，简化代码层次。

#### 4.3.2 调用 Kroki 的健壮性

- 为 Kroki 请求增加超时控制：
  - 如 10 秒超时，超时则返回 504 风格错误信息，并提示用户稍后重试。
- 对异常和非 2xx 响应：
  - 继续封装为统一的错误 JSON（保持现有结构），增加简单的错误码字段（例如 `code: 'KROKI_ERROR'`）。

#### 4.3.3 缓存策略

- 保留当前内存缓存 `Map<string, CacheEntry>`：
  - 单实例缓存可减少重复请求的延迟与外部调用次数。
  - 文档中明确说明：在 Serverless 多实例场景下，缓存不保证全局一致，仅作为性能优化手段。
- 未来如有需要，可以进一步考虑：
  - 使用外部缓存（如 Redis）或基于 HTTP 缓存（ETag/Last-Modified）方案，这不在本次重构范围内。

#### 4.3.4 日志与可观测性

- 在以下场景中增加基础日志（`console.error` 即可）：
  - Kroki 调用返回非 2xx。
  - 超时或网络异常。
  - 输入过长导致被拒绝。
- 日志内容不包含原始 `code` 内容，以避免泄露敏感信息，可仅记录：
  - `engine`, `format`。
  - `code.length`。
  - Kroki 状态码或错误信息摘要。

### 4.4 安全性与 SVG 渲染

#### 4.4.1 前端安全

- Mermaid 本地渲染：
  - 初始化时开启更严格的 `securityLevel`（例如 `strict`），限制 SVG 内的潜在危险特性。
- Graphviz 本地渲染：
  - 输出为 SVG 文本，同样需要注意 XSS 风险；在文档中说明当前信任本地渲染库产生的 SVG，主要用于受信任环境。
- 可选增强：引入一个轻量的 SVG 清洗逻辑：
  - 在将 SVG 注入 DOM 前进行简单的标签/属性白名单过滤。
  - 考虑到 KISS 原则，此步骤可以作为“可选扩展”，首版重构中可以只调整 Mermaid 的安全选项。

#### 4.4.2 后端安全

- 后端不对 SVG 做修改，仅作为透明代理与缓存层。
- 在文档（README/本重构文档）中明确说明：
  - 应用当前主要面向自用/内部使用场景。
  - 如需在高安全要求环境使用，应结合前端 SVG 清洗或额外安全网关。

---

## 5. 重构实施阶段

### 阶段 1：引擎配置模块与后端基础增强

**目标**：不改动 UI 结构，先统一配置与加强后端健壮性。

- **任务**：
  - 新增 `lib/diagramConfig.ts`：抽取 `Engine`/`Format` 列表、标签映射、Kroki 映射信息。
  - 调整 `app/api/render/route.ts`：
    - 使用 `diagramConfig` 校验 `engine` 和 `format`。
    - 增加 `code` 长度限制。
    - 为 Kroki 请求增加超时控制。
    - 在错误场景增加最小化日志输出。
  - 前端 `page.tsx`：
    - 改用 `diagramConfig` 中的常量渲染下拉与标签。

**风险**：
- 若配置模块错误可能导致部分合法请求被拒绝，需通过单元测试和手工回归验证。

---

### 阶段 2：前端组件拆分与 Hook 抽取

**目标**：
- 降低 `app/page.tsx` 复杂度，使 UI 组件与业务逻辑解耦。

- **任务**：
  - 新建 `components/EditorPanel.tsx` 和 `components/PreviewPanel.tsx`。
  - 新建 `hooks/useDiagramState.ts`：
    - 提取当前关于 URL Query 与 `localStorage` 的 `useEffect` 逻辑。
  - 新建 `hooks/useDiagramRender.ts`：
    - 提取本地渲染、远程渲染、下载与 AbortController 管理相关逻辑。
  - 重写 `app/page.tsx`：
    - 使用上述 Hook 获取状态与操作函数。
    - 将 UI 渲染职责下沉到 `EditorPanel` 和 `PreviewPanel`。

**风险**：
- 拆分过程中容易引入小 bug（如漏传某个 props、状态依赖变更），需要对以下场景做回归：
  - 切换引擎/格式。
  - 本地渲染与远程渲染的 fallback 路径。
  - 下载 SVG/PNG/PDF。
  - 刷新页面后的 URL & localStorage 恢复逻辑。

---

### 阶段 3：安全与体验增强

**目标**：
- 在不改变核心功能的前提下，加强安全性与错误提示体验。

- **任务**：
  - Mermaid 初始化配置中加入安全选项（`securityLevel` 等）。
  - 根据需要调整 `error` 消息处理逻辑，使前端提示更友好、信息更一致。
  - 可选：引入简单 SVG 清洗逻辑，用于 Kroki 返回的 SVG。

**风险**：
- 安全选项过于严格可能导致部分合法图形无法渲染，需要在文档中说明，并为高级用户提供“关闭/放松安全检查”的可配置入口（例如环境变量或配置常量）。

---

### 阶段 4：清理与文档

**目标**：
- 清理重复代码、更新相关文档与 changelog。

- **任务**：
  - 删除不再使用的辅助函数、常量或注释掉的旧逻辑。
  - 更新 `README.md`：
    - 简述新的架构分层与扩展方式。
    - 明确 Kroki 依赖和安全注意事项。
  - 在 `changelog` 目录中记录本次重构的关键变更点。

**风险**：
- 若误删仍被依赖的代码，需要依靠 TypeScript 编译错误和基本测试来发现问题。

---

## 6. 非目标（本次重构不做的事情）

为避免范围过大，本次重构明确不包含：

- 更换技术栈（例如从 Next.js 切换到其他框架）。
- 引入复杂的状态管理库（如 Redux、MobX 等）。
- 新增权限体系、多用户协作等特性。
- 把 Kroki 自建到内部基础设施（仍使用现有对接方式，或通过环境变量切换不同 Kroki 实例）。

如未来有需要，可以基于本次重构后的更清晰结构继续演进。

---

## 7. 验收标准

重构完成后，建议从以下几个角度进行验收：

- **功能回归**：
  - 不同引擎、不同格式的渲染与下载行为与现有版本一致或有明确改进。
  - URL 分享与本地状态恢复功能正常。
- **代码结构**：
  - `app/page.tsx` 行数和复杂度明显下降，主要由组件组合和 Hook 调用构成。
  - 引擎与格式相关常量统一集中在 `lib/diagramConfig.ts`。
- **健壮性与安全性**：
  - 超长输入能被服务端合理拒绝，并返回可理解的错误信息。
  - Kroki 不可用或超时时，有清晰的错误提示，并在 Netlify 日志中可查。
  - Mermaid 渲染启用更严格的安全选项。
- **可扩展性**：
  - 增加新引擎/新格式时，只需在配置模块中新增条目，并在前端 UI 中做少量改动。

当上述标准达到时，可认为 GraphViewer 的基础架构已经完成一轮健康的重构，为后续功能扩展打下良好基础。
