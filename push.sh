#!/usr/bin/env bash
set -euo pipefail

SERVER="user@140.113.160.136"
REMOTE_REPO="~/nycueelab"
NGINX_DIR="/usr/share/nginx/html/nycueelab"
COMPOSE_FILE="docker-compose.dev.yml"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/frontend"

echo "==> [1/5] Building frontend locally in WSL..."
npm run build

echo "==> [2/5] Pulling latest code on $SERVER..."
ssh "$SERVER" "cd $REMOTE_REPO && git pull --ff-only"

echo "==> [3/5] Stopping containers on $SERVER..."
ssh "$SERVER" "cd $REMOTE_REPO && docker compose -f $COMPOSE_FILE down"

echo "==> [4/5] Syncing dist/ to $SERVER..."
rsync -az --delete dist/ "$SERVER:$REMOTE_REPO/frontend/dist/"

echo "==> [5/5] Swapping nginx contents and bringing containers back up..."
ssh "$SERVER" "bash -s" <<EOF
set -e
rm -rf $NGINX_DIR/*
cp -r $REMOTE_REPO/frontend/dist/* $NGINX_DIR/
cd $REMOTE_REPO && docker compose -f $COMPOSE_FILE up --build -d
EOF

echo "==> Done."
