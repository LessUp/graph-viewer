---
trigger: glob
globs:
  - '**/*.test.ts'
  - '**/*.test.tsx'
  - vitest.config.ts
  - vitest.setup.ts
---

# GraphViewer 测试规则

## 测试栈

- Vitest + `@testing-library/react` + `jsdom`
- 不要引入 Jest 语法（`jest.fn()`、`jest.mock()`）或额外测试框架。

## 文件位置

新增或修改测试时，优先复用现有目录模式：

- `lib/__tests__/*.test.ts`
- `hooks/__tests__/*.test.tsx`
- `components/__tests__/*.test.tsx`
- `app/**/route.test.ts`

## Mock 要求

- 浏览器 API（`localStorage`、`File.text()`、`history`、`URL.createObjectURL`、`navigator.clipboard`）要显式 mock。
- 使用 `vi.fn()`、`vi.mock()`、`vi.stubGlobal()`，不要用 Jest 对应方法。
- 每个测试后清理：`afterEach(() => vi.restoreAllMocks())`。
- 详细的 mock 模式示例见 `graphviewer-testing` skill。

## 编码风格

- `catch` 块使用 `catch (e: unknown)` + `instanceof Error` 收窄。
- 测试描述可以用中文或英文，与被测文件保持一致即可。

## 验证

测试相关改动完成后：

- 运行 `npm run test`
- 如果同时改动了业务代码，再运行 `npm run lint`
