#!/bin/bash
set -e

APP_DIR="/home/lucascolaco/lucas-os"   
BUILD_DIR="$APP_DIR/dist"
DEPLOY_DIR="/var/www/lucascolaco"
BRANCH="main"  
USER="lucascolaco"
GROUP="www-data"

echo "🚀 Starting deployment of React app to lucascolaco.com..."

cd "$APP_DIR"

echo "📌 Pulling latest changes from Git..."
git fetch origin
git reset --hard origin/$BRANCH

echo "📦 Installing dependencies..."
npm install

echo "🏗️ Building the app for production..."
npm run build

echo "🧹 Cleaning old deployment files..."
sudo mkdir -p "$DEPLOY_DIR"
sudo rsync -av --delete "$BUILD_DIR/" "$DEPLOY_DIR/"

echo "🔑 Setting permissions..."
sudo chown -R $USER:$GROUP "$DEPLOY_DIR"
sudo find "$DEPLOY_DIR" -type d -exec chmod 755 {} \;
sudo find "$DEPLOY_DIR" -type f -exec chmod 644 {} \;

echo "🔄 Reloading Nginx..."
sudo nginx -t && sudo systemctl reload nginx

echo "✅ Deployment finished successfully!"
