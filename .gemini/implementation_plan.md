# Implementation Plan - Fix Graceful Shutdown

Resolve errors in `src/server.ts` related to the graceful shutdown implementation added by the user.

## Problem Code
The user added code to `src/server.ts` that attempts to:
1. Call `server.close()` - but `initServer` does not return the HTTP server instance.
2. Call `closeAllSessions({})` - but `getAllTokens` (called internally) expects `req.logger` to exist if an error occurs.

## Proposed Changes

### `src/index.ts`
#### [MODIFY] `initServer`
- Update return type to include `http: http.Server`.
- Return the `http` instance.

### `src/server.ts`
#### [MODIFY] `gracefulShutdown`
- Extract `http` from `initServer` return.
- Pass `{ logger }` as the mock request to `closeAllSessions` to prevent crashes on error logging.

## Verification Plan

### Manual Verification
1. Start server: `npm run dev` or `docker compose up`.
2. Send SIGINT (Ctrl+C).
3. Verify logs show "Starting graceful shutdown...", "All sessions closed successfully", and "HTTP server closed".
