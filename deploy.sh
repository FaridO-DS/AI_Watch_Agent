#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "🚀 Starting Automated Deployment Pipeline..."

# 1. Pull latest changes from git
echo "📥 Fetching latest code from repository..."
git pull origin main

# 2. Build Frontend Static Assets (Outside Docker, directly on VPS)
echo "📦 Building Frontend Static Assets..."
cd frontend
npm install
npm run build
cd ..

# 3. Synchronize Docker containers
echo "🐋 Orchestrating Docker containers (Backend & FastAPI)..."
# --build forces Docker to re-compile images if requirements.txt or package.json changed
# -d runs containers in detached mode (background)
docker compose up --build -d

# 4. Clean up dangling resources to preserve VPS disk space
echo "🧹 Cleaning up unused Docker layers..."
docker image prune -f

# 5. Reload Nginx configuration smoothly
echo "⚙️ Reloading Nginx Reverse Proxy..."
sudo nginx -t
sudo systemctl reload nginx

echo "✅ Deployment completed successfully! Application is live."
