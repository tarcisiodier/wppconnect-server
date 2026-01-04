#!/bin/sh

# WPPConnect Server - Docker Entrypoint with PM2
# Cleans up Chromium lock files and manages graceful shutdown

set -e

echo "🔍 Checking for Chromium processes and lock files..."

# Kill any existing Chromium processes first
pkill -f chromium 2>/dev/null || true
pkill -f chrome 2>/dev/null || true

# Wait for processes to die
sleep 2

# Clean up any stale Chromium lock files
if [ -d "/usr/src/wpp-server/userDataDir" ]; then
  find /usr/src/wpp-server/userDataDir -name "SingletonLock" -type f -delete 2>/dev/null || true
  find /usr/src/wpp-server/userDataDir -name "SingletonSocket" -type f -delete 2>/dev/null || true
  find /usr/src/wpp-server/userDataDir -name "SingletonCookie" -type f -delete 2>/dev/null || true
  # Adicional: limpar crash files
  find /usr/src/wpp-server/userDataDir -name "Crashpad" -type d -exec rm -rf {} + 2>/dev/null || true
  echo "✓ Lock files and crash data cleaned"
else
  echo "ℹ No userDataDir found yet"
fi

# Create required directories
mkdir -p /usr/src/wpp-server/logs
mkdir -p /usr/src/wpp-server/tokens
mkdir -p /usr/src/wpp-server/userDataDir

# Setup graceful shutdown handler
cleanup() {
  echo ""
  echo "🛑 Received shutdown signal, stopping PM2 gracefully..."
  
  # Stop PM2 apps gracefully (30s timeout)
  pm2 stop all --silent || true
  sleep 2
  pm2 delete all --silent || true
  pm2 kill --silent || true

  echo "🧹 Force killing any remaining Chromium processes..."
  pkill -9 chromium 2>/dev/null || true
  pkill -9 chrome 2>/dev/null || true

  echo "🔓 Final cleanup of lock files..."
  find /usr/src/wpp-server/wppconnect_userdata -name "SingletonLock" -type f -delete 2>/dev/null || true
  find /usr/src/wpp-server/wppconnect_userdata -name "SingletonSocket" -type f -delete 2>/dev/null || true
  find /usr/src/wpp-server/wppconnect_userdata -name "SingletonCookie" -type f -delete 2>/dev/null || true

  echo "✅ Cleanup complete"
  exit 0
}

# Trap signals for graceful shutdown
trap cleanup SIGTERM SIGINT SIGQUIT

echo "🚀 Starting WPPConnect Server with PM2..."

# Execute PM2 in runtime mode (keeps container alive)
exec "$@" &
CHILD_PID=$!

# Wait for child process and handle signals
wait $CHILD_PID