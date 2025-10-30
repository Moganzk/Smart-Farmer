#!/usr/bin/env bash
# deploy/deploy_server.sh
# Run this on the droplet as root or a user with repo access.
# This script pulls the cleaned branch and rebuilds docker-compose.

set -euo pipefail
BRANCH="fix/uuid-randomuuid-clean"
REPO_DIR="/opt/smart-farmer"
ENV_PATH="$REPO_DIR/BACKEND/.env"

echo "Deploy script starting: will update $REPO_DIR to $BRANCH and rebuild containers"

if [ ! -d "$REPO_DIR" ]; then
  echo "ERROR: repo directory $REPO_DIR not found. Clone your repository there first." >&2
  exit 2
fi

cd "$REPO_DIR"

echo "Fetching latest from origin..."
git fetch origin --prune

# Checkout the target branch, or create it if not present locally
if git show-ref --verify --quiet refs/heads/${BRANCH##*/}; then
  git checkout ${BRANCH##*/}
else
  git checkout -B ${BRANCH##*/} origin/${BRANCH##*/}
fi

# Ensure local matches remote
git reset --hard origin/${BRANCH##*/}

# Ensure server-only .env exists (we don't create secrets here)
if [ ! -f "$ENV_PATH" ]; then
  echo "WARNING: $ENV_PATH not found. Create it now with the production secrets (DO NOT commit it)." >&2
  echo "Example:"
  echo "  cat > $ENV_PATH <<'EOF'"
  echo "  DATABASE_URL=postgres://user:pass@host:5432/dbname"
  echo "  JWT_SECRET=your_jwt_secret"
  echo "  EOF"
  exit 3
fi

chmod 600 "$ENV_PATH" || true

# Rebuild and restart docker
echo "Building docker images (no cache) and restarting..."
docker compose -f deploy/docker-compose.yml build --no-cache

docker compose -f deploy/docker-compose.yml up -d --force-recreate

# Show logs summary
echo "Tailing app logs (last 200 lines). Use 'docker compose -f deploy/docker-compose.yml logs -f app' to follow live logs."
docker compose -f deploy/docker-compose.yml logs --tail=200 app || true

echo "Deploy complete. Check 'docker compose -f deploy/docker-compose.yml ps' and nginx status."
