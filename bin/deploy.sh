#!/usr/bin/env bash
#
# deploy.sh — run this ON the server. Pulls latest code, builds, deploys, reloads nginx.
#
# Usage:  cd ~/myapp && ./deploy.sh

set -euo pipefail

# ── CONFIG ──────────────────────────────────────────────
REPO_DIR="$HOME/lucas-os"          # where your git repo lives
REMOTE_DIR="/var/www/myapp"     # web root nginx serves from
BRANCH="master"                   # branch to deploy
# ────────────────────────────────────────────────────────

GREEN="\033[0;32m"; NC="\033[0m"
step() { echo -e "${GREEN}==>${NC} $1"; }

cd "$REPO_DIR"

step "Pulling latest code ($BRANCH)"
git pull origin "$BRANCH"

step "Installing dependencies"
npm install

step "Building"
npm run build

step "Deploying dist/ to $REMOTE_DIR"
sudo rsync -av --delete dist/ "$REMOTE_DIR/"

step "Reloading nginx"
sudo nginx -t && sudo systemctl reload nginx

echo -e "${GREEN}✔ Done.${NC}"
