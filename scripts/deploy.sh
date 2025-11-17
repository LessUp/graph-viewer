#!/usr/bin/env sh
set -e
ENV=${ENV:-prod}
if ! command -v docker >/dev/null 2>&1; then echo "docker not found"; exit 1; fi
if ! docker compose version >/dev/null 2>&1; then echo "docker compose not found"; exit 1; fi
if [ "$ENV" = "dev" ]; then PROFILE=dev; SERVICE=web-dev; elif [ "$ENV" = "test" ]; then PROFILE=test; SERVICE=web-test; else PROFILE=prod; SERVICE=web; fi
echo "env=$ENV profile=$PROFILE service=$SERVICE"
if [ "$ENV" = "dev" ]; then docker compose --profile $PROFILE up $SERVICE; else docker compose --profile $PROFILE up -d --build $SERVICE; fi
echo "waiting for health"
for i in $(seq 1 30); do if curl -fsS http://localhost:3000/api/healthz >/dev/null 2>&1; then echo "healthy"; break; else sleep 2; fi; done
if ! curl -fsS http://localhost:3000/api/healthz >/dev/null 2>&1; then echo "unhealthy"; docker compose logs $SERVICE | tail -n 200; exit 1; fi
echo "ready at http://localhost:3000"