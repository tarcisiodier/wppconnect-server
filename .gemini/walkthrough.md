# Webhook Data Enrichment Walkthrough (Session Token)

## Changes Implemented

### 1. Session Token Injection (`src/util/createSessionUtil.ts`)
- Added logic to fetch the browser session token using `client.getSessionTokenBrowser()`.
- This token is now attached to the `sessionToken` field in the webhook payload for both `onmessage` and `onselfmessage` events.
- This allows external systems to have the necessary credentials to restore or manage the session if needed.

**Code Snippet:**
```typescript
try {
  const sessionToken = await client.getSessionTokenBrowser();
  message.sessionToken = sessionToken;
} catch (e) {
  req.logger.warn(`Could not get session token for ${client.session}`);
}
```

## Verification Results

### Automatic Build & Deploy
- Executed `deploy.sh`.
- Containers are rebuilding.

### Payload Structure
- **Event**: `onmessage` / `onselfmessage`
  - `message.sessionToken`: Contains the WAToken/BrowserToken object.
  - `message.contactDetail`: Contains the standardized contact info.

### Log Verification
- **Command**: `docker compose logs -f wppconnect`
- **Expected Result**: Server starts successfully.
