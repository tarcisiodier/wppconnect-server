#!/bin/bash

# WPPConnect Server - Safe Deployment Script
# This script ensures clean deployment without Chromium lock issues

set -e  # Exit on error

echo "🚀 Starting WPPConnect Server deployment..."

# Step 1: Stop and remove old containers
echo "📦 Stopping old containers..."
docker-compose down || true

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

# Step 3: Build new image
echo "🔨 Building Docker image..."
docker-compose build

# Step 4: Start new containers
echo "🚢 Starting new containers..."
docker-compose up -d

# Step 5: Show logs
echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Container status:"
docker-compose ps

echo ""
echo "📊 Following logs (Ctrl+C to exit):"
docker-compose logs -f --tail=50
