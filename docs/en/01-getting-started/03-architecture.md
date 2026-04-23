# Architecture Overview

Understanding GraphViewer's architecture and design principles.

## Tech Stack

| Technology   | Version | Purpose                         |
| ------------ | ------- | ------------------------------- |
| Next.js      | 15      | React framework with App Router |
| React        | 19      | UI library                      |
| TypeScript   | 5.4+    | Type-safe JavaScript            |
| Tailwind CSS | 3.4     | Utility-first styling           |
| Node.js      | 20+     | Runtime environment             |

## Project Structure

```
graph-viewer/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Main page component
│   ├── layout.tsx         # Root layout
│   ├── globals.css        # Global styles
│   └── api/               # API routes
│       ├── render/        # Kroki proxy with caching
│       └── healthz/       # Health check
├── components/            # React components
│   ├── EditorPanel.tsx    # Code editor and controls
│   ├── PreviewPanel.tsx   # Diagram preview with zoom/pan
│   ├── PreviewToolbar.tsx # Preview controls
│   ├── DiagramList.tsx    # Workspace diagram manager
│   └── ...
├── hooks/                 # Custom React hooks
│   ├── useDiagramState.ts # State management + persistence
│   ├── useDiagramRender.ts # Rendering logic
│   ├── useLivePreview.ts  # Debounced preview
│   └── ...
├── lib/                   # Utility modules
│   ├── diagramConfig.ts   # Engine/format definitions
│   ├── diagramSamples.ts  # Sample code snippets
│   ├── exportUtils.ts     # Export implementations
│   └── types.ts           # TypeScript types
├── docs/                  # Documentation
├── changelog/             # Version history
└── scripts/               # Build and test scripts
```

## Data Flow

### Rendering Pipeline

```
User Input (EditorPanel)
    ↓
useDiagramState (state + URL + localStorage)
    ↓
useLivePreview (debounced 300ms)
    ↓
useDiagramRender
    ├── Local Render (Mermaid/Graphviz WASM)
    └── Remote Render → POST /api/render → Kroki
    ↓
PreviewPanel (display)
```

### State Persistence

1. **URL Query Parameters**: Share state via compressed URLs
2. **localStorage**: Persist workspace across sessions
3. **Key**: `graphviewer:state:v1`

## Rendering Architecture

### Hybrid Rendering

GraphViewer uses a hybrid approach for optimal performance:

#### Local Rendering (Client-Side)

- **Mermaid**: Direct browser rendering with `mermaid` library
- **Graphviz**: WebAssembly-based rendering with `@hpcc-js/wasm`
- **Advantages**: Fast, works offline, no data leaves browser

#### Remote Rendering (Server-Side)

- **All Engines**: Via Kroki service proxy
- **Endpoint**: `/api/render` with in-memory caching
- **Advantages**: Supports all 16+ engines, consistent output

### Rendering Decision Tree

```
Engine Requested
    ↓
Can Render Locally?
    ├── Yes (Mermaid/Graphviz SVG)
    │   └── Try Local → Success → Display
    │       └── Fail → Fallback to Remote
    └── No
        └── Remote Render via /api/render
```

## Caching Strategy

### Server-Side Cache (`/api/render`)

- **Type**: In-memory Map
- **Key**: SHA-256 of request body
- **TTL**: 1 hour with periodic cleanup
- **Benefits**: Reduces Kroki calls, faster repeat renders

### Client-Side Persistence

- **localStorage**: Workspace state (diagrams, settings)
- **Session Storage**: UI preferences
- **URL Compression**: LZ-string for shareable links

## Security Considerations

1. **SVG Sanitization**: DOMPurify sanitizes all SVG content
2. **Mermaid Security**: `securityLevel: 'strict'` prevents XSS
3. **Input Validation**: Server validates engine/format/code length
4. **CORS**: API routes properly configured

## Extension Points

### Adding New Engines

1. Add to `lib/diagramConfig.ts`: `ENGINE_LIST`, `ENGINE_LABELS`
2. Add sample to `lib/diagramSamples.ts`
3. Update syntax highlighting in `lib/syntaxHighlight.ts`

### Adding Export Formats

1. Implement in `lib/exportUtils.ts`
2. Add button to `PreviewToolbar.tsx`
3. Update type definitions in `lib/types.ts`

## Performance Optimizations

- **Debounced Preview**: 300ms delay reduces unnecessary renders
- **Lazy Loading**: WASM modules loaded on demand
- **Code Splitting**: Next.js automatic code splitting
- **AbortController**: Cancel stale render requests
