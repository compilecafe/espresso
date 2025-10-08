#!/bin/sh
set -e

DB_HOST="${POSTGRES_HOST:-db}"
DB_USER="${POSTGRES_USER}"
DB_PASS="${POSTGRES_PASSWORD}"
DB_NAME="${POSTGRES_DB}"

while ! PGPASSWORD="$DB_PASS" pg_isready -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" >/dev/null 2>&1; do
  echo "⏳ Waiting for database $DB_HOST/$DB_NAME as $DB_USER..."
  sleep 2
done

echo "✅ Database is up! Running migrations..."

bun run --bun drizzle-kit push

echo "🚀 Starting bot..."
exec bun run src/index.ts
