# 2025-11-18 抽取 diagramConfig 与 /api/render 加固

- 新增 `lib/diagramConfig.ts`：
  - 集中维护 Engine/Format 类型、集合、标签以及 Kroki 类型映射。
  - 暴露 `isEngine`、`isFormat`、`getKrokiType`、`canUseLocalRender` 等辅助方法，供前后端共用。
- 更新 `app/api/render/route.ts`：
  - 改用 `diagramConfig` 进行引擎与格式校验，统一引擎到 Kroki 类型的映射逻辑。
  - 新增 `MAX_CODE_LENGTH` 限制（当前为 100000 字符），超长请求直接返回 413，防止单次请求滥用。
  - 为 Kroki 请求增加超时控制（`KROKI_TIMEOUT_MS`，当前为 10000ms），超时返回 504 风格错误。
  - 在 Kroki 网络错误、渲染失败、超长输入以及意外异常场景下增加基础日志输出，仅记录 engine/format/长度等摘要信息。
  - 保持原有 `/api/render` 请求与响应契约兼容，缓存与 binary 下载行为不变。
