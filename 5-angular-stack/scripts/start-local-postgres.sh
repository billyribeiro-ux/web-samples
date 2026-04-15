#!/usr/bin/env bash
# Start a dev-only Postgres on 127.0.0.1:5434 without Docker (Homebrew postgresql).
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
PGDATA="$ROOT/.pgdata-local"
export PATH="/opt/homebrew/opt/postgresql@18/bin:/opt/homebrew/opt/postgresql/bin:$PATH"

if ! command -v initdb >/dev/null 2>&1; then
  echo "Install PostgreSQL: brew install postgresql@18" >&2
  exit 1
fi

if pg_ctl -D "$PGDATA" status >/dev/null 2>&1; then
  echo "Postgres already running (.pgdata-local)."
  exit 0
fi

if [ ! -f "$PGDATA/PG_VERSION" ]; then
  echo "Initializing database cluster in .pgdata-local …"
  initdb -D "$PGDATA" -E UTF8 --locale=C
  {
    echo "listen_addresses = '127.0.0.1'"
    echo "port = 5434"
  } >>"$PGDATA/postgresql.conf"
  echo "host all all 127.0.0.1/32 trust" >>"$PGDATA/pg_hba.conf"
fi

echo "Starting Postgres on 127.0.0.1:5434 …"
pg_ctl -D "$PGDATA" -l "$PGDATA/server.log" start
sleep 2

SUPERUSER="${USER:-postgres}"
export PGHOST=127.0.0.1
export PGPORT=5434

psql -U "$SUPERUSER" -d postgres -v ON_ERROR_STOP=1 -c "
DO \$\$
BEGIN
  CREATE ROLE platform WITH LOGIN PASSWORD 'platform' SUPERUSER CREATEDB;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
\$\$;
"

if ! psql -U "$SUPERUSER" -d postgres -tc "SELECT 1 FROM pg_database WHERE datname = 'platform'" | grep -q 1; then
  psql -U "$SUPERUSER" -d postgres -c "CREATE DATABASE platform OWNER platform;"
fi

echo "Local Postgres ready: postgresql://platform:platform@127.0.0.1:5434/platform"
