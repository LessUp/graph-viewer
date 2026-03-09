---
description: Docker 开发环境管理：构建/启动/进入/清理 DevContainer，快速搭建一致的开发环境。
---

1. Start the development container with hot reload:

```
docker compose --profile dev up -d --build web-dev
```

2. Wait for the container to be ready:
   // turbo

```
docker compose logs web-dev --tail 20
```

3. Open browser at http://localhost:3000

4. (Optional) Start a local Kroki server alongside the dev container:

```
docker compose --profile dev --profile kroki up -d
```

Kroki will be at http://localhost:8000. Update Settings modal → Kroki URL.

5. View live logs:
   // turbo

```
docker compose logs -f web-dev
```

6. Run commands inside the container:

```
docker compose exec web-dev sh
```

7. Run tests inside the container:

```
docker compose exec web-dev npm run test
```

8. Rebuild after dependency changes:

```
docker compose --profile dev up -d --build web-dev
```

9. Stop and clean up:

```
docker compose --profile dev --profile kroki down
```

10. Full cleanup (remove volumes and images):

```
docker compose --profile dev --profile kroki down -v --rmi local
```
