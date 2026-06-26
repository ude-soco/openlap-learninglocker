#!/usr/bin/env bash
set -e

MONGO_HOST="${MONGO_HOST:-mongo}"
MONGO_PORT="${MONGO_PORT:-27017}"

echo "==> Waiting for MongoDB at ${MONGO_HOST}:${MONGO_PORT} ..."
until bash -c "echo > /dev/tcp/${MONGO_HOST}/${MONGO_PORT}" 2>/dev/null; do
  sleep 2
done
echo "==> MongoDB is reachable."

echo "==> Running Mongo migrations ..."
node cli/dist/server migrateMongo --up

# Seed a default site admin exactly once (state kept on a named volume).
SEED_DIR="/app/.seed-state"
SEED_MARKER="${SEED_DIR}/seeded"
SEED_ADMIN_EMAIL="${SEED_ADMIN_EMAIL:-learninglocker@uni-due.de}"
SEED_ADMIN_ORG="${SEED_ADMIN_ORG:-UDE}"
SEED_ADMIN_PASS="${SEED_ADMIN_PASS:-password123}"

mkdir -p "${SEED_DIR}"
if [ ! -f "${SEED_MARKER}" ]; then
  echo "==> Creating site admin ${SEED_ADMIN_EMAIL} (org: ${SEED_ADMIN_ORG}) ..."
  if node cli/dist/server createSiteAdmin "${SEED_ADMIN_EMAIL}" "${SEED_ADMIN_ORG}" "${SEED_ADMIN_PASS}"; then
    touch "${SEED_MARKER}"
    echo "==> Site admin created."
  else
    echo "==> Site admin creation failed or already exists; continuing."
  fi
else
  echo "==> Site admin already seeded; skipping."
fi

echo "==> Starting application: $*"
exec "$@"
