---
trigger: glob
globs:
  - '**/*.test.ts'
  - '**/*.test.tsx'
  - vitest.config.ts
  - vitest.setup.ts
---

# GraphViewer 测试规则

- 测试栈固定为：
  - Vitest
  - `@testing-library/react`
  - `jsdom`
- 新增或修改测试时，优先复用现有模式：
  - `lib/__tests__`
  - `hooks/__tests__`
  - `components/__tests__`
  - `app/**/route.test.ts`
- 浏览器 API、`File.text()`、`localStorage`、`history` 这类 JSDOM 易波动能力要显式 mock。
- 不要引入 Jest 语法或额外测试框架，除非需求明确要求。
- 测试相关改动完成后：
  - 运行 `npm run test`
  - 如果同时改动了业务代码或规则，再运行 `npm run lint`
