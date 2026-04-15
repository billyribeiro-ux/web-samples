#!/usr/bin/env bash
# Fresh local Postgres + MinIO, migrate, seed. Requires Docker Desktop running.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if ! docker info >/dev/null 2>&1; then
  echo "Docker is not running. Start Docker Desktop, then run: pnpm run stack:reset" >&2
  exit 1
fi

echo "Stopping containers and removing volumes (clean slate for Postgres data)…"
docker compose down -v

echo "Starting Postgres + MinIO…"
docker compose up -d postgres minio

bash scripts/wait-for-postgres.sh

echo "Applying migrations and seed…"
pnpm exec prisma migrate deploy
pnpm run db:seed

echo ""
echo "Done. Start the app with: pnpm dev:all   (or pnpm dev:api and pnpm dev:web in two terminals)"
