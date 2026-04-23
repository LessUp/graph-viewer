# Self-Hosted Kroki Integration

Deploy and integrate your own Kroki rendering service.

## Why Self-Host Kroki?

- **Privacy**: Diagram data never leaves your infrastructure
- **Reliability**: No dependency on external services
- **Offline**: Works without internet access
- **Performance**: Local network latency
- **Customization**: Control available diagram engines

## Deployment Options

### Option 1: Docker Compose (Recommended)

GraphViewer includes a Kroki service in `docker-compose.yml`:

```bash
# Start with self-hosted Kroki
docker compose --profile prod --profile kroki up -d

# Access:
# - GraphViewer: http://localhost:3000
# - Kroki: http://localhost:8000
```

This deploys:

- Kroki core server
- BlockDiag service
- Mermaid service
- All other diagram engines

### Option 2: Standalone Kroki

```bash
# Run Kroki container
docker run -d \
  --name kroki \
  -p 8000:8000 \
  yuzutech/kroki:latest

# Or with all services (comprehensive)
docker run -d \
  --name kroki \
  -p 8000:8000 \
  yuzutech/kroki:latest \
  --kroki-blockdiag-host=blockdiag \
  --kroki-mermaid-host=mermaid
  # ... additional services
```

### Option 3: Kubernetes

See [Kroki Kubernetes deployment guide](https://docs.kroki.io/kroki/setup/install/#kubernetes).

## Integration with GraphViewer

### Server-Side Configuration

Set environment variable:

```bash
# .env or docker-compose.yml
KROKI_BASE_URL=http://kroki:8000
```

For Docker Compose, services communicate internally:

```yaml
services:
  web:
    environment:
      - KROKI_BASE_URL=http://kroki:8000
    depends_on:
      - kroki

  kroki:
    image: yuzutech/kroki:latest
    # ...
```

### Client-Side Configuration

Users can specify custom Kroki in Settings:

1. Open Settings (gear icon)
2. Enable "Custom Render Server"
3. Enter URL (e.g., `https://kroki.company.com`)

Server must allow this URL via:

```bash
# Allow any client URL (development only)
KROKI_ALLOW_CLIENT_BASE_URL=true

# Or whitelist specific URLs
KROKI_CLIENT_BASE_URL_ALLOWLIST=https://kroki.company.com,https://kroki.example.com
```

### Testing Connection

```bash
# Test Kroki health
curl http://localhost:8000/health

# Test diagram rendering
curl -X POST http://localhost:8000/mermaid/svg \
  -d 'graph TD; A-->B;'
```

## Security Configuration

### Access Control

For production deployments:

```yaml
# docker-compose.yml with basic auth
services:
  kroki:
    image: yuzutech/kroki:latest
    environment:
      - KROKI_USERNAME=admin
      - KROKI_PASSWORD=secure-password
```

### Network Isolation

```yaml
# Only web service can access Kroki
services:
  web:
    networks:
      - frontend
      - backend

  kroki:
    networks:
      - backend
    # No port exposed to host

networks:
  frontend:
  backend:
    internal: true
```

### HTTPS/TLS

Use reverse proxy for HTTPS termination:

```nginx
# nginx.conf
upstream kroki {
    server localhost:8000;
}

server {
    listen 443 ssl;
    server_name kroki.example.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://kroki;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Troubleshooting

### Connection Refused

```bash
# Verify Kroki is running
docker ps | grep kroki

# Check logs
docker logs kroki

# Test connectivity from GraphViewer
docker exec graph-viewer curl http://kroki:8000/health
```

### URL Not Allowed

Error: `KROKI_BASE_URL_NOT_ALLOWED`

Solutions:

1. Add URL to `KROKI_CLIENT_BASE_URL_ALLOWLIST`
2. Set `KROKI_ALLOW_CLIENT_BASE_URL=true` (development)
3. Use server-side `KROKI_BASE_URL` instead

### CORS Errors

For GitHub Pages or external access:

```yaml
services:
  kroki:
    image: yuzutech/kroki:latest
    environment:
      - KROKI_CORS_ORIGIN=*
      # Or specific origin:
      # - KROKI_CORS_ORIGIN=https://diagrams.example.com
```

## Performance Tuning

### Resource Allocation

```yaml
services:
  kroki:
    deploy:
      resources:
        limits:
          cpus: '4'
          memory: 4G
        reservations:
          cpus: '1'
          memory: 1G
```

### Caching

GraphViewer includes in-memory caching for `/api/render`:

```typescript
// Cache configuration in route.ts
const CACHE_MAX_AGE_MS = 60 * 60 * 1000; // 1 hour
const CACHE_SIZE_LIMIT = 1000; // Max entries
```

For production scale, consider:

- Redis cache
- CDN caching
- HTTP caching headers

## Available Diagram Engines

Full Kroki supports 20+ engines:

| Engine    | Local   | Remote | Notes              |
| --------- | ------- | ------ | ------------------ |
| Mermaid   | ✅      | ✅     | Local uses browser |
| Graphviz  | ✅ WASM | ✅     |                    |
| PlantUML  | ❌      | ✅     | Java required      |
| D2        | ❌      | ✅     |                    |
| BlockDiag | ❌      | ✅     | Python             |
| SeqDiag   | ❌      | ✅     |                    |
| Nomnoml   | ❌      | ✅     |                    |
| Vega      | ❌      | ✅     |                    |
| Vega-Lite | ❌      | ✅     |                    |
| WaveDrom  | ❌      | ✅     |                    |
| ...       |         |        |                    |

## Maintenance

### Updates

```bash
# Update Kroki image
docker pull yuzutech/kroki:latest
docker compose --profile kroki up -d

# Check version
curl http://localhost:8000/health | jq .version
```

### Monitoring

```bash
# Health check endpoint
curl http://localhost:8000/health

# Prometheus metrics (if enabled)
curl http://localhost:8000/metrics
```

### Backup

Kroki is stateless - no backup required. Configuration is in compose file.
