---
description: Build and run GraphViewer with Docker, optionally with local Kroki
---

1. Build and start the production container:

```
docker compose --profile prod up -d --build web
```

2. Wait for health check to pass (up to 60s):
   // turbo

```
curl -fsS http://localhost:3000/api/healthz
```

3. Open browser at http://localhost:3000

4. (Optional) Start a local Kroki server for intranet use:

```
docker compose --profile kroki up -d kroki
```

Kroki will be available at http://localhost:8000. Update the app's Settings modal to point Kroki URL to `http://localhost:8000`.

5. View logs if something goes wrong:
   // turbo

```
docker compose logs web --tail 50
```

6. Stop all services:

```
docker compose --profile prod --profile kroki down
```
