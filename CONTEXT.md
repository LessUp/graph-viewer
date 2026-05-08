# GraphViewer 项目上下文

> 本文件定义项目的领域术语、架构决策和深度模块，帮助 AI 代理理解代码库结构。

## 领域术语

### 核心概念

**DiagramDoc（图表文档）**
- 用户创建和编辑的图表，包含引擎、格式、源代码等元数据
- 存储在 localStorage 和 URL 参数中
- 文件：`lib/types.ts`

**Engine（渲染引擎）**
- 图表渲染引擎类型：Mermaid、Graphviz、PlantUML、D2 等 16+ 种
- 定义在 `lib/diagramConfig.ts` 的 `ENGINE_CONFIGS`
- 分为本地渲染引擎（Mermaid、Graphviz、Flowchart.js）和远程渲染引擎（通过 Kroki）

**Format（输出格式）**
- 图表输出格式：SVG、PNG、PDF
- 定义在 `lib/diagramConfig.ts`

**Workspace（工作区）**
- 用户的图表集合，包含多个 DiagramDoc 和当前选中的 ID
- 持久化在 localStorage

### 渲染相关

**Renderer（渲染器）**
- 统一的渲染接口，支持本地 WASM 和远程 Kroki 两种实现
- 文件：`lib/render/types.ts`

**RenderStrategy（渲染策略）**
- 组合多个渲染器，按优先级选择合适的渲染器
- 文件：`lib/render/RendererStrategy.ts`

### 导出相关

**ExportService（导出服务）**
- 统一的导出接口，处理所有导出格式（SVG、PNG、HTML、Markdown 等）
- 文件：`lib/export/ExportService.ts`

**SvgPreprocessor（SVG 预处理器）**
- 将原始 SVG 处理为适合导出的格式（命名空间、样式内联、padding 等）
- 文件：`lib/export/SvgPreprocessor.ts`

### 错误处理

**ErrorCode（错误码）**
- 类型安全的错误码枚举，替代 magic strings
- 文件：`lib/errors/ApiError.ts`

**ApiError（API 错误）**
- 统一的错误类型，包含错误码和上下文
- 文件：`lib/errors/ApiError.ts`

## 架构决策

### ADR-0001: 导出层统一接口

**问题**：导出逻辑散落在多个文件，调用者需要知道 6+ 个函数

**决策**：创建 `ExportService` 深度模块，提供单一接口

**后果**：
- ✅ 调用者只需 `exportService.exportDiagram()`
- ✅ 所有导出逻辑集中管理
- ✅ 向后兼容：旧函数保留并标记 deprecated

**相关文件**：
- `lib/export/ExportService.ts`
- `lib/export/index.ts`
- `components/preview/PreviewToolbar.tsx`

### ADR-0002: 渲染器策略模式

**问题**：本地/远程渲染逻辑紧耦合，难以扩展新渲染器

**决策**：创建 `Renderer` 接口和策略模式

**后果**：
- ✅ 新渲染器只需实现 `Renderer` 接口
- ✅ 部署模式逻辑集中在策略构造
- ✅ 测试更容易 mock

**相关文件**：
- `lib/render/types.ts`
- `lib/render/LocalWasmRenderer.ts`
- `lib/render/RemoteKrokiRenderer.ts`
- `lib/render/RendererStrategy.ts`

### ADR-0003: 类型安全的错误处理

**问题**：错误码使用 magic strings，类型不安全

**决策**：创建 `ErrorCode` enum 和 `ApiError` 类

**后果**：
- ✅ 类型安全的错误码
- ✅ 错误消息集中管理
- ✅ 向后兼容：`toJSON()` 提供兼容格式

**相关文件**：
- `lib/errors/ApiError.ts`
- `lib/render/types.ts`
- `app/api/render/route.ts`

### ADR-0004: SVG 预处理器深度模块

**问题**：SVG 预处理函数过度分解，缺乏业务上下文

**决策**：创建 `SvgPreprocessor` 类，只暴露 `preprocess()` 方法

**后果**：
- ✅ 调用者只需调用一个方法
- ✅ 预处理逻辑集中管理
- ✅ 向后兼容：旧函数保留并标记 deprecated

**相关文件**：
- `lib/export/SvgPreprocessor.ts`
- `lib/export/svgProcessor.ts`

### ADR-0005: useDiagramState 保持不变

**问题**：hook 承担多种职责，是否需要拆分？

**决策**：保持不变，已经是深度模块

**理由**：
- 接口/实现比 = 14 / 379 ≈ 3.7%（深度模块）
- 所有职责围绕同一个概念（图表工作区状态）
- 只有 1 个消费者，拆分无复用收益
- 现有测试充分覆盖

**相关文件**：
- `hooks/useDiagramState.ts`
- `app/editor/page.tsx`

## 深度模块

### 定义

**深度模块** = 高杠杆 + 高局部性
- 接口小，实现有价值
- 修改集中在实现，不影响调用者

### GraphViewer 中的深度模块

| 模块 | 接口 | 实现行数 | 接口/实现比 | 深度 |
|------|------|---------|------------|------|
| ExportService | 2 个方法 | 216 | 0.9% | ✅ 深 |
| RendererStrategy | 2 个方法 | 77 | 2.6% | ✅ 深 |
| SvgPreprocessor | 2 个方法 | 205 | 1.0% | ✅ 深 |
| useDiagramState | 14 个字段 | 379 | 3.7% | ✅ 深 |
| ApiError | 3 个方法 | 118 | 2.5% | ✅ 深 |

## Seams（接缝）

### 定义

**Seam** = 接口存在的地方，行为可以在此改变而不修改调用者

### GraphViewer 中的 Seams

**Renderer Seam**
- 接口：`Renderer`
- 适配器：`LocalWasmRenderer`、`RemoteKrokiRenderer`
- 用途：添加新渲染引擎

**ExportService Seam**
- 接口：`ExportService`
- 适配器：内部组合 `SvgPreprocessor`、`CanvasRenderer`、`FileDownloader`
- 用途：添加新导出格式

**Storage Seam**
- 接口：`StorageAdapter`（在 `lib/storage.ts`）
- 适配器：`LocalStorageAdapter`、`MockStorageAdapter`
- 用途：测试时替换存储实现

## 反模式（避免）

### 浅层模块

**特征**：接口 ≈ 实现，删除不会集中复杂度

**例子**（已修复）：
- ❌ `lib/exportUtils.ts`（传递模块）→ ✅ 已移除重复逻辑
- ❌ `buildApiErrorMessage`（散落的错误消息）→ ✅ 已合并到 `ApiError`

### 过度分解

**特征**：纯函数缺乏业务上下文，测试覆盖误导

**例子**（已修复）：
- ❌ 6+ 个 SVG 预处理纯函数 → ✅ 合并为 `SvgPreprocessor.preprocess()`

### Magic Strings

**特征**：使用字符串字面量代替类型安全的枚举

**例子**（已修复）：
- ❌ `'KROKI_TIMEOUT'`、`'KROKI_NETWORK_ERROR'` → ✅ `ErrorCode.KROKI_TIMEOUT`

## 单一事实源

所有引擎、格式、展示分组、Kroki 类型和本地渲染能力定义在：

**`lib/diagramConfig.ts`**

业务代码禁止散落 magic string。修改引擎或格式时，必须同步更新：
1. `lib/diagramConfig.ts`
2. `lib/diagramSamples.ts`
3. `lib/syntaxHighlight.ts`
4. `lib/export/index.ts`
5. `hooks/useDiagramRender.ts`
6. `app/api/render/route.ts`
7. `openspec/specs/api/openapi.yaml`

## 测试策略

### 单元测试

- 位置：`**/__tests__/*.test.ts(x)`
- 框架：Vitest
- 原则：测试接口行为，而非实现细节

### 集成测试

- API 测试：`app/api/render/route.test.ts`
- Hook 测试：`hooks/__tests__/*.test.tsx`

### Smoke 测试

- 位置：`npm run test:smoke`
- 用途：验证生产服务器基本功能

## 部署模式

### 静态演示版（GitHub Pages）

- 可用：Mermaid、Graphviz、Flowchart.js 本地 SVG 渲染
- 不可用：`/api/render`、远程 Kroki、PNG/PDF 导出
- 构建：`npm run build:static`

### 完整服务版（Docker/Node）

- 可用：所有引擎、所有格式、AI 面板
- 构建：`npm run build`

## 变更记录

- 2026-05-08：创建文件，记录 4 轮架构重构决策
