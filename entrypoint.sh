#!/bin/sh
set -e

DB_HOST="db"
DB_USER="$(cat /run/secrets/postgres_user)"
DB_PASS="$(cat /run/secrets/postgres_pass)"
DB_NAME="$(cat /run/secrets/postgres_name)"

while ! PGPASSWORD="$DB_PASS" pg_isready -h "$DB_HOST" -U "$DB_USER" >/dev/null 2>&1; do
  echo "⏳ Waiting for database $DB_HOST/$DB_NAME as $DB_USER..."
  sleep 2
done

echo "✅ Database is up! Running migrations..."

bun run --bun drizzle-kit push

echo "🚀 Starting bot..."
exec bun run src/index.ts
