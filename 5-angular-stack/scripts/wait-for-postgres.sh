#!/usr/bin/env bash
set -euo pipefail
# Run from repo root after `docker compose up -d postgres`.
echo "Waiting for Postgres (compose service postgres)..."
for _ in {1..90}; do
  if docker compose exec -T postgres pg_isready -U platform -d platform >/dev/null 2>&1; then
    echo "Postgres is ready."
    exit 0
  fi
  sleep 1
done
echo "Timeout waiting for Postgres. Is Docker running?" >&2
exit 1
