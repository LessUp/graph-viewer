---
trigger: glob
globs:
  - app/**/*.ts
  - app/**/*.tsx
  - components/**/*.tsx
  - hooks/**/*.ts
  - lib/**/*.ts
  - app/api/**/*.ts
---

# GraphViewer 安全规则

## SVG 消毒

- 所有从 Kroki 或本地渲染引擎获取的 SVG 必须经过 `dompurify` 消毒后再注入 DOM。
- 不要使用 `dangerouslySetInnerHTML` 直接渲染未消毒的 SVG。
- `PreviewPanel.tsx` 中的 SVG 渲染已经使用 `sanitizedSvg`，新增预览路径时必须保持同样的消毒流程。

## XSS 防护

- 用户输入的图表代码不要直接拼接到 HTML 模板中。
- 导出 HTML 时（`lib/exportUtils.ts`），确保图表代码和 SVG 内容都经过转义或消毒。
- API 路由的错误响应不要回显用户原始输入内容。

## API 安全

- `app/api/render/route.ts` 的引擎白名单通过 `isEngine()` 校验，不要接受任意字符串作为引擎名。
- 代码长度上限 `MAX_CODE_LENGTH`（100KB）必须保持，防止滥用。
- Kroki 请求超时 `KROKI_TIMEOUT_MS`（10s）必须保持，防止慢速攻击。
- 不要在 API 路由中暴露内部错误堆栈或服务器路径信息。

## 环境变量与密钥

- 不要在代码中硬编码 API 密钥、认证令牌或敏感配置。
- 新增环境变量时同步更新 `.env.example`。
- `NEXT_PUBLIC_` 前缀的环境变量会暴露给客户端，不要用于敏感信息。

## 依赖安全

- 定期检查依赖漏洞（`npm audit`）。
- 不要引入已知有安全漏洞的包版本。
- `dompurify` 版本必须保持更新，它是 SVG 消毒的核心依赖。

## 数据隔离

- `localStorage` 中存储的工作区数据不包含认证信息。
- 分享链接（`lz-string` 压缩）只包含图表代码和引擎/格式信息，不要在分享链接中嵌入用户设置。
