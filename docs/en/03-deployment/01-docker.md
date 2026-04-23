# Docker Deployment

Deploy GraphViewer using Docker and Docker Compose.

## Quick Start

```bash
# Clone repository
git clone https://github.com/LessUp/graph-viewer.git
cd graph-viewer

# Production deployment with self-hosted Kroki
docker compose --profile prod --profile kroki up -d

# Access application at http://localhost:3000
```

## Docker Compose Profiles

GraphViewer provides multiple compose profiles for different use cases:

| Profile    | Description                 | Use Case                        |
| ---------- | --------------------------- | ------------------------------- |
| `dev`      | Development with hot reload | Local development               |
| `prod`     | Production build            | Production deployment           |
| `web-test` | Test environment            | Testing/CI                      |
| `kroki`    | Self-hosted Kroki service   | Offline/restricted environments |

### Development Environment

```bash
docker compose --profile dev up
```

Features:

- Hot reload enabled
- Source code mounted as volume
- Port: 3000
- Node.js debug port: 9229

### Production Environment

```bash
# Standalone deployment
docker compose --profile prod up -d

# With self-hosted Kroki
docker compose --profile prod --profile kroki up -d
```

Features:

- Optimized production build
- Standalone Next.js server
- No volume mounts

### Test Environment

```bash
docker compose --profile web-test up -d
```

Uses port 3001 to avoid conflicts with dev server.

## Configuration

### Environment Variables

Create a `.env` file for deployment configuration:

```env
# Kroki Configuration
KROKI_BASE_URL=http://kroki:8000

# Server Configuration
PORT=3000

# Optional: Allow client-side Kroki configuration
KROKI_ALLOW_CLIENT_BASE_URL=false
KROKI_CLIENT_BASE_URL_ALLOWLIST=https://kroki.example.com
```

### Self-Hosted Kroki

When using the `kroki` profile:

```yaml
services:
  kroki:
    image: yuzutech/kroki:latest
    ports:
      - '8000:8000'
    environment:
      - KROKI_BLOCKDIAG_HOST=blockdiag
      - KROKI_MERMAID_HOST=mermaid
    # ... additional Kroki services
```

Benefits:

- Works offline
- No external dependencies
- Consistent rendering across environments

## Standalone Docker

### Build Image

```bash
docker build -t graph-viewer:latest .
```

### Run Container

```bash
docker run -d \
  --name graph-viewer \
  -p 3000:3000 \
  -e KROKI_BASE_URL=https://kroki.io \
  graph-viewer:latest
```

### With Self-Hosted Kroki

```bash
# Run Kroki
docker run -d --name kroki -p 8000:8000 yuzutech/kroki

# Run GraphViewer with Kroki
docker run -d \
  --name graph-viewer \
  -p 3000:3000 \
  -e KROKI_BASE_URL=http://host.docker.internal:8000 \
  graph-viewer:latest
```

## Health Checks

Each service includes health checks:

```bash
# Check web service
curl http://localhost:3000/api/healthz

# Check Kroki
curl http://localhost:8000/health
```

## Production Considerations

### Reverse Proxy (Nginx)

```nginx
server {
    listen 80;
    server_name diagrams.example.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### HTTPS/TLS

Use a reverse proxy or cloud load balancer for HTTPS termination.

### Resource Limits

```yaml
services:
  web:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '0.5'
          memory: 512M
```

### Log Management

```bash
# View logs
docker compose logs -f web

# Rotate logs
docker logs --since 24h graph-viewer 2>&1 | gzip > logs-$(date +%Y%m%d).gz
```

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker compose logs web

# Verify environment variables
docker compose config
```

### Kroki Connection Failed

```bash
# Test Kroki connectivity
docker exec graph-viewer curl http://kroki:8000/health

# Check network
docker network ls
docker network inspect graph-viewer_default
```

### Port Conflicts

```bash
# Check port usage
lsof -i :3000

# Use different host port
docker compose -p 3001:3000 --profile prod up -d
```

## Updating

```bash
# Pull latest images
docker compose pull

# Recreate containers
docker compose --profile prod up -d --force-recreate

# Clean up old images
docker image prune -f
```
