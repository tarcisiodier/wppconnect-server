#!/bin/sh

# WPPConnect Server - Docker Entrypoint with PM2
# Cleans up Chromium lock files and manages graceful shutdown

set -e

echo "🔍 Checking for Chromium lock files..."

# Clean up any stale Chromium lock files
if [ -d "/usr/src/wpp-server/userDataDir" ]; then
  find /usr/src/wpp-server/userDataDir -name "SingletonLock" -type f -delete 2>/dev/null || true
  find /usr/src/wpp-server/userDataDir -name "SingletonSocket" -type f -delete 2>/dev/null || true
  find /usr/src/wpp-server/userDataDir -name "SingletonCookie" -type f -delete 2>/dev/null || true
  echo "✓ Lock files cleaned"
else
  echo "ℹ No userDataDir found yet"
fi

# Create logs directory if it doesn't exist
mkdir -p /usr/src/wpp-server/logs

# Setup graceful shutdown handler
cleanup() {
  echo ""
  echo "🛑 Received shutdown signal, stopping PM2 gracefully..."
  pm2 stop all
  pm2 kill

  echo "🧹 Cleaning up Chromium processes..."
  pkill -9 chromium 2>/dev/null || true

  echo "🔓 Removing lock files..."
  find /usr/src/wpp-server/userDataDir -name "SingletonLock" -type f -delete 2>/dev/null || true
  find /usr/src/wpp-server/userDataDir -name "SingletonSocket" -type f -delete 2>/dev/null || true
  find /usr/src/wpp-server/userDataDir -name "SingletonCookie" -type f -delete 2>/dev/null || true

  echo "✅ Cleanup complete"
  exit 0
}

# Trap signals for graceful shutdown
trap cleanup SIGTERM SIGINT SIGQUIT

echo "🚀 Starting WPPConnect Server with PM2..."

# Execute PM2 in runtime mode (keeps container alive)
exec "$@"
