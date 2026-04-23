# RFC-0002: API Design

**Status**: Accepted
**Created**: 2026-04-17
**Author**: GraphViewer Team

## Context

This RFC documents the API design for GraphViewer's server-side endpoints.

## API Routes

### POST /api/render

Kroki proxy for remote diagram rendering.

**Request**:

```typescript
{
  engine: string; // Diagram engine (from diagramConfig.ts)
  format: string; // Output format (svg, png, pdf)
  code: string; // Diagram source code (max 100KB)
}
```

**Response**:

```typescript
{
  svg?: string;        // SVG content (if format === 'svg')
  base64?: string;     // Base64 encoded content (for png/pdf)
  contentType: string; // MIME type
}
```

**Constraints**:

- In-memory cache with TTL 120 seconds
- 10 second timeout for Kroki requests
- 100KB code size limit
- Engine whitelist validation

### GET /api/healthz

Health check endpoint for Docker/Netlify deployment.

**Response**: `200 OK` with `{ status: "ok" }`

## Caching Strategy

The render endpoint uses an in-memory LRU cache with:

- TTL: 120 seconds
- Cache key: hash of (engine + format + code)
- Eviction: LRU when cache reaches capacity

## Error Handling

All API errors follow this format:

```typescript
{
  error: string;       // Human-readable error message
  code?: string;       // Machine-readable error code
}
```

Common error codes:

- `ENGINE_NOT_SUPPORTED`
- `INVALID_FORMAT`
- `CODE_TOO_LARGE`
- `RENDER_TIMEOUT`
- `RENDER_FAILED`

## References

- [Core Architecture RFC](0001-core-architecture.md) — Overall architecture decisions
- [OpenAPI Specification](../api/openapi.yaml) — Full machine-readable API definition
- [Testing Specs](../testing/diagram-render.feature) — API test requirements
