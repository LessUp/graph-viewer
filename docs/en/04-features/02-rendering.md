# Rendering Engines

GraphViewer supports 16+ diagram engines through hybrid rendering.

## Engine Categories

### Popular Engines

| Engine         | Type                    | Local   | Remote |
| -------------- | ----------------------- | ------- | ------ |
| Mermaid        | Text-to-Diagram         | ✅      | ✅     |
| PlantUML       | UML Diagrams            | ❌      | ✅     |
| Graphviz (DOT) | Graph Visualization     | ✅ WASM | ✅     |
| D2             | Declarative Diagramming | ❌      | ✅     |

### Flowchart Series

| Engine       | Best For          |
| ------------ | ----------------- |
| Flowchart.js | Simple flowcharts |
| BlockDiag    | Block diagrams    |
| ActDiag      | Activity diagrams |

### Sequence & Network

| Engine  | Best For          |
| ------- | ----------------- |
| SeqDiag | Sequence diagrams |
| NwDiag  | Network diagrams  |

### Data Visualization

| Engine    | Best For                |
| --------- | ----------------------- |
| Vega      | Complex visualizations  |
| Vega-Lite | Statistical charts      |
| WaveDrom  | Digital timing diagrams |

### ASCII Art

| Engine  | Best For          |
| ------- | ----------------- |
| Ditaa   | ASCII to diagrams |
| SVGBob  | ASCII art         |
| Nomnoml | UML from text     |

### Other

| Engine | Best For            |
| ------ | ------------------- |
| ERD    | Entity-Relationship |

## Rendering Modes

### Local Rendering

Runs directly in the browser:

```typescript
// Mermaid
import mermaid from 'mermaid';
mermaid.initialize({ securityLevel: 'strict' });

// Graphviz WASM
import { Graphviz } from '@hpcc-js/wasm';
const graphviz = await Graphviz.load();
```

**Advantages:**

- Fast - no network latency
- Private - data stays in browser
- Works offline
- Always available

**Limitations:**

- Limited to Mermaid and Graphviz
- WASM bundle size (~2MB)
- Browser memory constraints

### Remote Rendering

Proxied through `/api/render` to Kroki:

```typescript
// POST /api/render
const response = await fetch('/api/render', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    engine: 'plantuml',
    format: 'svg',
    code: diagramCode,
  }),
});
```

**Advantages:**

- Supports all 16+ engines
- Consistent server-side rendering
- No browser limitations

**Requirements:**

- Network connectivity
- Kroki service (public or self-hosted)
- Server for API routes (not static export)

### Hybrid Decision

GraphViewer automatically chooses:

```
Can render locally?
  ├── Yes (Mermaid/Graphviz SVG)
  │   └── Try local
  │       ├── Success → Display
  │       └── Error → Fallback to remote
  └── No
      └── Remote render via Kroki
```

## Engine Selection

### By Use Case

#### Software Architecture

- **Mermaid**: General diagrams, GitHub native
- **PlantUML**: Comprehensive UML
- **Graphviz**: Complex graphs, layouts

#### Documentation

- **Mermaid**: Markdown compatible
- **D2**: Modern, readable syntax
- **Nomnoml**: Quick UML sketches

#### System Design

- **PlantUML**: Component diagrams
- **BlockDiag**: High-level blocks
- **NwDiag**: Network topology

#### Data & Analytics

- **Vega/Vega-Lite**: Data-driven charts
- **Graphviz**: Relationship graphs
- **WaveDrom**: Timing diagrams

### Format Selection

| Format | Best For    | Notes              |
| ------ | ----------- | ------------------ |
| SVG    | General use | Editable, scalable |
| PNG    | Sharing     | Raster, fixed size |
| PDF    | Print       | Document embedding |

## Engine Configuration

### Available Formats per Engine

| Engine   | SVG | PNG | PDF |
| -------- | --- | --- | --- |
| Mermaid  | ✅  | ✅  | ✅  |
| PlantUML | ✅  | ✅  | ✅  |
| Graphviz | ✅  | ✅  | ✅  |
| D2       | ✅  | ❌  | ❌  |
| Vega     | ✅  | ✅  | ✅  |
| ...      |     |     |     |

### Syntax Highlighting

CodeMirror provides syntax highlighting based on engine:

```typescript
// lib/syntaxHighlight.ts
const languageMap: Record<string, string> = {
  mermaid: 'markdown',
  plantuml: 'markdown',
  graphviz: 'javascript', // Using JS for DOT
  javascript: 'javascript',
  // ...
};
```

## Performance Considerations

### Local Rendering

| Factor       | Impact                                 |
| ------------ | -------------------------------------- |
| Diagram size | Large diagrams take longer to parse    |
| Complexity   | Nested structures increase render time |
| Browser      | Chrome/Firefox generally faster        |

### Remote Rendering

| Factor          | Impact                          |
| --------------- | ------------------------------- |
| Network latency | Affects response time           |
| Kroki load      | Shared instances may queue      |
| Diagram type    | Some engines slower than others |
| Caching         | Repeat renders are instant      |

### Optimization Tips

1. **Prefer local engines** when possible
2. **Use SVG** format for best quality
3. **Cache enabled** for remote renders
4. **Debounce inputs** (300ms) to reduce renders

## Troubleshooting

### Local Rendering Issues

**Mermaid parse error:**

- Check syntax validity
- Try Mermaid Live Editor for debugging
- Update mermaid library

**Graphviz WASM not loading:**

- Check network for WASM files
- Verify CDN or local path configuration
- Check browser console for errors

### Remote Rendering Issues

**Timeout (504):**

- Diagram too complex
- Kroki service overloaded
- Network issues

**Parse error (400):**

- Invalid diagram syntax
- Unsupported engine/format combination

**Connection refused:**

- Kroki service not running
- Wrong KROKI_BASE_URL
- Firewall blocking

## Adding New Engines

To add support for a new engine:

1. **Register engine** in `lib/diagramConfig.ts`:

   ```typescript
   export const ENGINE_LIST = [
     // ... existing engines
     'newengine',
   ] as const;
   ```

2. **Add labels**:

   ```typescript
   export const ENGINE_LABELS: Record<string, string> = {
     newengine: 'New Engine',
   };
   ```

3. **Add sample code** in `lib/diagramSamples.ts`:

   ```typescript
   newengine: `diagram code here`;
   ```

4. **Configure Kroki mapping** (if remote):

   ```typescript
   export const KROKI_TYPES: Record<string, string> = {
     newengine: 'newengine',
   };
   ```

5. **Add syntax highlighting** in `lib/syntaxHighlight.ts`

6. **Update tests** in relevant test files
