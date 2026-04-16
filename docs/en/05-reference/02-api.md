# API Reference

Complete reference for GraphViewer API endpoints.

## Base URL

| Environment | Base URL |
|-------------|----------|
| Development | `http://localhost:3000` |
| Production | Your deployment URL |

## Endpoints

### GET /api/healthz

Health check endpoint.

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2026-04-16T10:36:25.457Z",
  "version": "1.0.0"
}
```

**Status Codes:**

| Code | Description |
|------|-------------|
| 200 | Service is healthy |

---

### POST /api/render

Render a diagram using Kroki.

**Request:**

```typescript
{
  engine: string;       // Diagram engine (mermaid, plantuml, etc.)
  format: string;       // Output format (svg, png, pdf)
  code: string;         // Diagram source code
  binary?: boolean;     // Return binary instead of JSON
  krokiBaseUrl?: string; // Optional: custom Kroki URL
}
```

**Headers:**

```
Content-Type: application/json
X-GraphViewer-Version: 1.0.0
```

**Example Request:**

```bash
curl -X POST http://localhost:3000/api/render \
  -H "Content-Type: application/json" \
  -d '{
    "engine": "mermaid",
    "format": "svg",
    "code": "graph TD; A-->B;"
  }'
```

**Success Response (SVG):**

```json
{
  "result": "<svg>...</svg>",
  "engine": "mermaid",
  "format": "svg",
  "cached": false
}
```

**Success Response (PNG/PDF binary):**

Binary data with appropriate Content-Type header.

**Error Responses:**

| Status | Error Code | Description |
|--------|------------|-------------|
| 400 | `INVALID_ENGINE` | Unsupported engine |
| 400 | `INVALID_FORMAT` | Unsupported format |
| 400 | `INVALID_KROKI_BASE_URL` | Malformed Kroki URL |
| 400 | `KROKI_BASE_URL_NOT_ALLOWED` | URL not in allowlist |
| 413 | `PAYLOAD_TOO_LARGE` | Code exceeds 100,000 chars |
| 502 | `KROKI_ERROR` | Kroki returned error |
| 504 | `KROKI_TIMEOUT` | Request timed out |

**Error Response Format:**

```json
{
  "error": "KROKI_ERROR",
  "message": "Failed to render diagram",
  "details": "Syntax error in graph",
  "krokiUrl": "https://kroki.io"
}
```

**Caching:**

Successful responses include cache indicator:

```
X-Cache: HIT    // Served from cache
X-Cache: MISS   // Rendered fresh
```

---

### Client-Side Rendering (Not API)

Local rendering bypasses the API:

#### Mermaid (Browser)

```typescript
import mermaid from 'mermaid';

mermaid.initialize({
  securityLevel: 'strict',
  startOnLoad: false,
});

const { svg } = await mermaid.render('id', code);
```

#### Graphviz WASM (Browser)

```typescript
import { Graphviz } from '@hpcc-js/wasm';

const graphviz = await Graphviz.load();
const svg = graphviz.dot(code);
```

## Engine Support Reference

### Supported Engines

| Engine | Kroki Type | Local Support |
|--------|------------|---------------|
| mermaid | mermaid | ✅ Browser |
| plantuml | plantuml | ❌ |
| graphviz | graphviz | ✅ WASM |
| d2 | d2 | ❌ |
| nomnoml | nomnoml | ❌ |
| blockdiag | blockdiag | ❌ |
| seqdiag | seqdiag | ❌ |
| actdiag | actdiag | ❌ |
| nwdiag | nwdiag | ❌ |
| packetdiag | packetdiag | ❌ |
| rackdiag | rackdiag | ❌ |
| c4plantuml | c4plantuml | ❌ |
| ditaa | ditaa | ❌ |
| erd | erd | ❌ |
| excalidraw | excalidraw | ❌ |
| pikchr | pikchr | ❌ |
| svgbob | svgbob | ❌ |
| symbolator | symbolator | ❌ |
| umlet | umlet | ❌ |
| vega | vega | ❌ |
| vegalite | vegalite | ❌ |
| wavedrom | wavedrom | ❌ |

### Supported Formats

| Format | MIME Type | Description |
|--------|-----------|-------------|
| svg | image/svg+xml | Scalable vector |
| png | image/png | Raster image |
| pdf | application/pdf | Document |

**Note:** Not all engines support all formats. Check Kroki documentation for compatibility.

## WebSocket (Not Implemented)

Future versions may support WebSocket for:
- Real-time collaborative editing
- Live preview streaming
- Multi-user cursors

No WebSocket endpoints are currently available.

## Rate Limiting

Current implementation has no explicit rate limiting. For production:

1. Use reverse proxy (nginx) for rate limiting
2. Implement request throttling in middleware
3. Add API key authentication

## Examples

### Render Mermaid Flowchart

```bash
curl -X POST http://localhost:3000/api/render \
  -H "Content-Type: application/json" \
  -d '{
    "engine": "mermaid",
    "format": "svg",
    "code": "graph TD\n  A[Start] --> B{Decision}\n  B -->|Yes| C[Action 1]\n  B -->|No| D[Action 2]"
  }'
```

### Render PlantUML Class Diagram

```bash
curl -X POST http://localhost:3000/api/render \
  -H "Content-Type: application/json" \
  -d '{
    "engine": "plantuml",
    "format": "png",
    "code": "@startuml\nclass User\nclass Order\nUser \"1\" --> \"*\" Order : places\n@enduml"
  }' \
  --output diagram.png
```

### Use Custom Kroki Instance

```bash
curl -X POST http://localhost:3000/api/render \
  -H "Content-Type: application/json" \
  -d '{
    "engine": "mermaid",
    "format": "svg",
    "code": "graph TD; A-->B;",
    "krokiBaseUrl": "https://internal-kroki.company.com"
  }'
```

## SDK / Client Libraries

No official SDK is provided. Use standard HTTP clients:

### JavaScript/TypeScript

```typescript
async function renderDiagram(
  engine: string,
  format: string,
  code: string
): Promise<string> {
  const response = await fetch('/api/render', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ engine, format, code }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  const data = await response.json();
  return data.result;
}
```

### Python

```python
import requests

def render_diagram(engine: str, format: str, code: str) -> str:
    response = requests.post(
        "http://localhost:3000/api/render",
        json={"engine": engine, "format": format, "code": code}
    )
    response.raise_for_status()
    return response.json()["result"]
```

### Go

```go
package main

import (
    "bytes"
    "encoding/json"
    "net/http"
)

type RenderRequest struct {
    Engine string `json:"engine"`
    Format string `json:"format"`
    Code   string `json:"code"`
}

func renderDiagram(engine, format, code string) (string, error) {
    req := RenderRequest{Engine: engine, Format: format, Code: code}
    body, _ := json.Marshal(req)
    
    resp, err := http.Post(
        "http://localhost:3000/api/render",
        "application/json",
        bytes.NewBuffer(body),
    )
    if err != nil {
        return "", err
    }
    defer resp.Body.Close()
    
    var result map[string]interface{}
    json.NewDecoder(resp.Body).Decode(&result)
    return result["result"].(string), nil
}
```
