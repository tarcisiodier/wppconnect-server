#!/bin/bash

# WPPConnect Server - Remote Deployment Script
# Run this on your production server where Docker is running

set -e  # Exit on error

echo "🚀 Starting WPPConnect Server deployment..."

# Step 1: Stop and remove old containers
echo "📦 Stopping old containers..."
docker-compose down || true

# Wait a bit to ensure containers are fully stopped
echo "⏳ Waiting for containers to stop..."
sleep 3

# Step 2: Remove Chromium lock files if they exist
echo "🔓 Cleaning up Chromium lock files..."
if [ -d "./wppconnect_userdata" ]; then
  find ./wppconnect_userdata -name "SingletonLock" -type f -delete 2>/dev/null || true
  find ./wppconnect_userdata -name "SingletonSocket" -type f -delete 2>/dev/null || true
  find ./wppconnect_userdata -name "SingletonCookie" -type f -delete 2>/dev/null || true
  echo "   ✓ Lock files cleaned"
else
  echo "   ℹ No userdata directory found (first deployment)"
fi

# Step 3: Pull latest code (if using git)
if [ -d ".git" ]; then
  echo "📥 Pulling latest code..."
  git pull || echo "   ⚠ Could not pull (not a git repo or no changes)"
fi

# Step 4: Build new image
echo "🔨 Building Docker image..."
docker-compose build --no-cache

# Step 5: Start new containers
echo "🚢 Starting new containers..."
docker-compose up -d

# Wait for container to start
echo "⏳ Waiting for container to start..."
sleep 5

# Step 6: Show status
echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Container status:"
docker-compose ps

echo ""
echo "📊 Recent logs:"
docker-compose logs --tail=30

echo ""
echo "💡 To follow logs: docker-compose logs -f"
echo "💡 To restart: docker-compose restart"
echo "💡 To stop: docker-compose down"
