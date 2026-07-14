#!/bin/sh
set -e

echo "Waiting for the database to accept connections..."
# Apply migrations. retried a few times in case Postgres is still starting.
n=0
until npx prisma migrate deploy; do
  n=$((n+1))
  if [ "$n" -ge 10 ]; then
    echo "Database did not become ready in time."
    exit 1
  fi
  echo "Database not ready yet, retry $n..."
  sleep 3
done

echo "Seeding the database..."
npx tsx prisma/seed.ts || echo "Seed skipped or already done."

echo "Starting RishtaScore on port 3000..."
exec npm run start
