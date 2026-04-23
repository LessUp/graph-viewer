# Product TODO

> Priority tags: `[P1]` High, `[P2]` Medium, `[P3]` Low
> Module tags: `[frontend]`, `[backend]`, `[devops]`, `[docs]`

---

## Editor & Preview

### Editor ✅ Complete

- [x] [P1][frontend] Selected CodeMirror as editor
- [x] [P1][frontend] Editor component implementation
- [x] [P1][frontend] Syntax highlighting configuration
- [x] [P1][frontend] Line numbers, indentation, bracket matching
- [x] [P1][frontend] `Ctrl+Enter` triggers render
- [x] [P2][frontend] `Ctrl+S` exports source code

### Preview Area ✅ Complete

- [x] [P1][frontend] SVG preview zoom
- [x] [P1][frontend] Mouse drag pan
- [x] [P2][frontend] Fit to screen button
- [x] [P2][frontend] PNG/PDF preview styling and error handling

### Live Preview ✅ Complete

- [x] [P2][frontend] Live preview toggle
- [x] [P2][frontend] Debounced auto-render

### Share Links ✅ Complete

- [x] [P1][frontend] LZ-string compression
- [x] [P2][frontend] Graceful decode error handling

---

## Stability & Engineering

### Testing

- [x] [P1][backend] Vitest configuration
- [x] [P1][backend] `lib/diagramConfig.ts` unit tests
- [x] [P1][backend] `app/api/render/route.ts` unit tests
- [x] [P2][backend] Hooks basic tests

### Code Quality ✅ Complete

- [x] [P1][devops] ESLint integration
- [x] [P1][devops] Prettier integration
- [x] [P1][devops] Lint scripts

### Deployment ✅ Complete

- [x] [P1][devops] Fixed deploy.sh health check port
- [x] [P2][devops] Optimized Dockerfile
- [x] [P2][devops] Node.js version unified to 22

---

## Advanced Features

### Multi-Diagram Management ✅ Complete

- [x] [P1][frontend] Multi-diagram data structure
- [x] [P1][frontend] Diagram list switching
- [x] [P2][frontend] localStorage persistence

### Template Library ✅ Complete

- [x] [P2][frontend] Template configuration structure
- [x] [P2][frontend] Common templates added
- [x] [P2][frontend] "Create from template" entry point

### Import/Export ✅ Complete

- [x] [P2][frontend] Import source files
- [x] [P2][frontend] Export source code files

---

## Operations & Security

### CI/CD ✅ Complete

- [x] [P2][devops] GitHub Actions pipeline
- [x] [P2][devops] CI smoke tests

### Security ✅ Complete

- [x] [P3][frontend] SVG sanitization (DOMPurify)
- [x] [P3][docs] Security documentation

---

## Pending Items

### Feature Enhancements

- [ ] [P3][backend] `/api/share` short-link sharing

### Operations Enhancements

- [ ] [P3][backend] Structured logging (JSON)
- [ ] [P3][backend] Error tracking (Sentry)

### Documentation

- [ ] [P3][docs] Built-in template list with screenshots
