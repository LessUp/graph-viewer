#!/usr/bin/env sh
set -e

ENV=${ENV:-prod}

# 检查依赖
if ! command -v docker >/dev/null 2>&1; then echo "docker not found"; exit 1; fi
if ! docker compose version >/dev/null 2>&1; then echo "docker compose not found"; exit 1; fi

# 根据环境选择 profile 和 service
if [ "$ENV" = "dev" ]; then
  PROFILE=dev
  SERVICE=web-dev
elif [ "$ENV" = "test" ]; then
  PROFILE=test
  SERVICE=web-test
else
  PROFILE=prod
  SERVICE=web
fi

echo "env=$ENV profile=$PROFILE service=$SERVICE"

# 启动服务
if [ "$ENV" = "dev" ]; then
  docker compose --profile "$PROFILE" up "$SERVICE"
else
  docker compose --profile "$PROFILE" up -d --build "$SERVICE"
fi

# 健康检查（最多等待 60 秒）
echo "waiting for health"
HEALTH_URL="http://localhost:3000/api/healthz"
for i in $(seq 1 30); do
  if curl -fsS "$HEALTH_URL" >/dev/null 2>&1; then
    echo "healthy"
    break
  fi
  sleep 2
done

if ! curl -fsS "$HEALTH_URL" >/dev/null 2>&1; then
  echo "unhealthy"
  docker compose logs "$SERVICE" | tail -n 200
  exit 1
fi

echo "ready at http://localhost:3000"
