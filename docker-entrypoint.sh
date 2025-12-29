#!/bin/sh

# WPPConnect Server - Docker Entrypoint
# Cleans up Chromium lock files before starting the server

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

echo "🚀 Starting WPPConnect Server..."

# Execute the main command (node dist/server.js)
exec "$@"
